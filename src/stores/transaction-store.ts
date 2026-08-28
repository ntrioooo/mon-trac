import { create } from "zustand";
import type { Transaction } from "@/types/transaction";
import { transactionRepository } from "@/lib/repositories/transaction-repository";
import { syncEngine } from "@/lib/sync-engine";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;

  // Actions
  loadTransactions: () => Promise<void>;
  loadMonthTransactions: (year: number, month: number) => Promise<void>;
  addTransaction: (transaction: Transaction, userIdentifier?: string | null) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>, userIdentifier?: string | null) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true });
    try {
      const transactions = await transactionRepository.getAll();
      set({ transactions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMonthTransactions: async (year: number, month: number) => {
    set({ isLoading: true });
    try {
      const transactions = await transactionRepository.getByMonth(year, month);
      set({ transactions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transaction: Transaction, userIdentifier?: string | null) => {
    // 1. Save locally to Dexie (Instant)
    await transactionRepository.create(transaction);

    // 2. Optimistic UI update
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));

    // 3. Background Cloud Sync to Supabase
    syncEngine.syncTransaction(transaction, userIdentifier);
  },

  updateTransaction: async (id: string, data: Partial<Transaction>, userIdentifier?: string | null) => {
    // 1. Update locally
    await transactionRepository.update(id, data);
    const updated = await transactionRepository.getById(id);

    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    }));

    // 2. Background Cloud Sync to Supabase
    if (updated) {
      syncEngine.syncTransaction(updated, userIdentifier);
    }
  },

  deleteTransaction: async (id: string) => {
    // 1. Delete locally
    await transactionRepository.delete(id);

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));

    // 2. Delete from Supabase
    syncEngine.deleteTransaction(id);
  },
}));
