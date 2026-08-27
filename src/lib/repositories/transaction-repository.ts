import { db } from "@/lib/db";
import type { Transaction } from "@/types/transaction";

export const transactionRepository = {
  async create(transaction: Transaction): Promise<string> {
    return db.transactions.add(transaction);
  },

  async update(id: string, data: Partial<Transaction>): Promise<number> {
    return db.transactions.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  async getAll(): Promise<Transaction[]> {
    return db.transactions.orderBy("date").reverse().toArray();
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return db.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return this.getByDateRange(startDate, endDate);
  },

  async getByCategoryId(categoryId: string): Promise<Transaction[]> {
    return db.transactions.where("categoryId").equals(categoryId).toArray();
  },

  async count(): Promise<number> {
    return db.transactions.count();
  },

  async clear(): Promise<void> {
    await db.transactions.clear();
  },
};
