import { create } from "zustand";
import type { Transaction, PaymentMethod } from "@/types/transaction";
import { transactionRepository } from "@/lib/repositories/transaction-repository";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;

  // Actions
  loadTransactions: () => Promise<void>;
  loadMonthTransactions: (year: number, month: number) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
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

  addTransaction: async (transaction: Transaction) => {
    await transactionRepository.create(transaction);
    // Optimistic: add to local state immediately
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    await transactionRepository.update(id, data);
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTransaction: async (id: string) => {
    await transactionRepository.delete(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },
}));
