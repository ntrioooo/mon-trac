import { db } from "@/lib/db";
import type { Transaction } from "@/types/transaction";

export const transactionRepository = {
  async create(transaction: Transaction): Promise<string> {
    const now = new Date().toISOString();
    const item: Transaction = {
      ...transaction,
      createdAt: transaction.createdAt || now,
      updatedAt: transaction.updatedAt || now,
    };
    await db.transactions.put(item);
    return item.id;
  },

  async update(id: string, data: Partial<Transaction>): Promise<number> {
    const existing = await db.transactions.get(id);
    if (!existing) return 0;

    await db.transactions.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return 1;
  },

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  async getAll(): Promise<Transaction[]> {
    return await db.transactions.orderBy("date").reverse().toArray();
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const all = await db.transactions.toArray();
    return all
      .filter((t) => t.date.startsWith(prefix))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async getByDate(date: string): Promise<Transaction[]> {
    return await db.transactions.where("date").equals(date).toArray();
  },

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    return await db.transactions.where("categoryId").equals(categoryId).toArray();
  },

  async getByWallet(walletId: string): Promise<Transaction[]> {
    const all = await db.transactions.toArray();
    return all.filter((t) => t.walletId === walletId || t.toWalletId === walletId);
  },

  async count(): Promise<number> {
    return await db.transactions.count();
  },

  async clear(): Promise<void> {
    await db.transactions.clear();
  },
};
