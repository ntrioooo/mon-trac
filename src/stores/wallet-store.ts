import { create } from "zustand";
import type { Wallet } from "@/types/wallet";
import type { Transaction } from "@/types/transaction";
import { walletRepository } from "@/lib/repositories/wallet-repository";
import { syncEngine } from "@/lib/sync-engine";

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;

  loadWallets: () => Promise<void>;
  addWallet: (wallet: Wallet, userIdentifier?: string | null) => Promise<void>;
  updateWallet: (id: string, data: Partial<Wallet>, userIdentifier?: string | null) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  setDefaultWallet: (id: string, userIdentifier?: string | null) => Promise<void>;

  /** Calculate dynamic balance for a single wallet from all transactions. */
  getWalletBalance: (walletId: string, transactions: Transaction[]) => number;
  /** Calculate total net worth across all wallets. */
  getTotalBalance: (transactions: Transaction[]) => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  isLoading: false,

  loadWallets: async () => {
    set({ isLoading: true });
    try {
      const wallets = await walletRepository.getAll();
      set({ wallets, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addWallet: async (wallet: Wallet, userIdentifier?: string | null) => {
    // 1. Save locally to Dexie (Instant)
    await walletRepository.create(wallet);

    // 2. Optimistic UI update
    set((state) => ({ wallets: [...state.wallets, wallet] }));

    // 3. Background Cloud Sync with E2EE
    syncEngine.syncWallet(wallet, userIdentifier);
  },

  updateWallet: async (id: string, data: Partial<Wallet>, userIdentifier?: string | null) => {
    // 1. Update locally
    await walletRepository.update(id, data);
    const updated = await walletRepository.getById(id);

    set((state) => ({
      wallets: state.wallets.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: new Date().toISOString() } : w
      ),
    }));

    // 2. Background Cloud Sync with E2EE
    if (updated) {
      syncEngine.syncWallet(updated, userIdentifier);
    }
  },

  deleteWallet: async (id: string) => {
    // 1. Delete locally
    await walletRepository.delete(id);

    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
    }));

    // 2. Delete from Supabase
    syncEngine.deleteWallet(id);
  },

  setDefaultWallet: async (id: string, userIdentifier?: string | null) => {
    await walletRepository.setDefault(id);
    const updatedWallets = await walletRepository.getAll();

    set({ wallets: updatedWallets });

    // Sync all updated wallets
    for (const w of updatedWallets) {
      syncEngine.syncWallet(w, userIdentifier);
    }
  },

  getWalletBalance: (walletId: string, transactions: Transaction[]) => {
    const wallet = get().wallets.find((w) => w.id === walletId);
    if (!wallet) return 0;

    let balance = wallet.initialBalance;

    for (const t of transactions) {
      if (t.type === "income" && t.walletId === walletId) {
        balance += t.amount;
      } else if (t.type === "expense" && t.walletId === walletId) {
        balance -= t.amount;
      } else if (t.type === "transfer") {
        if (t.walletId === walletId) balance -= t.amount;
        if (t.toWalletId === walletId) balance += t.amount;
      }
    }

    return balance;
  },

  getTotalBalance: (transactions: Transaction[]) => {
    const { wallets, getWalletBalance } = get();
    return wallets.reduce((sum, w) => sum + getWalletBalance(w.id, transactions), 0);
  },
}));
