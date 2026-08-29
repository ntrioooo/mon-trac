import { create } from "zustand";
import type { Wallet } from "@/types/wallet";
import type { Transaction } from "@/types/transaction";
import { walletRepository } from "@/lib/repositories/wallet-repository";

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;

  loadWallets: () => Promise<void>;
  addWallet: (wallet: Wallet) => Promise<void>;
  updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  setDefaultWallet: (id: string) => Promise<void>;

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

  addWallet: async (wallet: Wallet) => {
    await walletRepository.create(wallet);
    set((state) => ({ wallets: [...state.wallets, wallet] }));
  },

  updateWallet: async (id: string, data: Partial<Wallet>) => {
    await walletRepository.update(id, data);
    set((state) => ({
      wallets: state.wallets.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: new Date().toISOString() } : w
      ),
    }));
  },

  deleteWallet: async (id: string) => {
    await walletRepository.delete(id);
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
    }));
  },

  setDefaultWallet: async (id: string) => {
    await walletRepository.setDefault(id);
    set((state) => ({
      wallets: state.wallets.map((w) => ({ ...w, isDefault: w.id === id })),
    }));
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
