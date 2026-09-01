import { db } from "@/lib/db";
import type { Wallet } from "@/types/wallet";

export const walletRepository = {
  async getAll(): Promise<Wallet[]> {
    return await db.wallets.orderBy("createdAt").toArray();
  },

  async getById(id: string): Promise<Wallet | undefined> {
    return await db.wallets.get(id);
  },

  async getDefault(): Promise<Wallet | undefined> {
    return await db.wallets.filter((w) => !!w.isDefault).first();
  },

  async create(wallet: Wallet): Promise<string> {
    const now = new Date().toISOString();
    const item: Wallet = {
      ...wallet,
      createdAt: wallet.createdAt || now,
      updatedAt: wallet.updatedAt || now,
    };
    await db.wallets.put(item);
    return item.id;
  },

  async update(id: string, data: Partial<Wallet>): Promise<number> {
    const existing = await db.wallets.get(id);
    if (!existing) return 0;
    await db.wallets.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return 1;
  },

  async delete(id: string): Promise<void> {
    await db.wallets.delete(id);
  },

  async setDefault(id: string): Promise<void> {
    // Unset all defaults first
    await db.wallets.toCollection().modify({ isDefault: false });
    // Set the new default
    await db.wallets.update(id, { isDefault: true, updatedAt: new Date().toISOString() });
  },

  async count(): Promise<number> {
    return await db.wallets.count();
  },
};
