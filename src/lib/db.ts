import Dexie, { type Table } from "dexie";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import type { Settings } from "@/types/settings";
import type { Wallet } from "@/types/wallet";
import { DEFAULT_CATEGORIES } from "@/types/category";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { DEFAULT_WALLETS } from "@/types/wallet";

export class MoneyTrackDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  settings!: Table<Settings, string>;
  wallets!: Table<Wallet, string>;
  syncedTxnIds!: Table<{ id: string; lastSyncedAt: string }, string>;
  pendingDeletions!: Table<{ id: string; deletedAt: string }, string>;

  constructor() {
    super("MoneyTrackDB");

    this.version(1).stores({
      transactions: "id, date, categoryId, paymentMethod, createdAt",
      categories: "id, name, isDefault",
      settings: "id",
    });

    this.version(2).stores({
      transactions: "id, date, categoryId, paymentMethod, createdAt",
      categories: "id, name, isDefault",
      settings: "id",
      syncedTxnIds: "id, lastSyncedAt",
      pendingDeletions: "id, deletedAt",
    });

    // v3: Add wallets table, update transactions index to include type + walletId
    this.version(3).stores({
      transactions: "id, date, categoryId, type, walletId, createdAt",
      categories: "id, name, isDefault, type",
      settings: "id",
      wallets: "id, name, type, isDefault, createdAt",
      syncedTxnIds: "id, lastSyncedAt",
      pendingDeletions: "id, deletedAt",
    }).upgrade(async (trans) => {
      // Migrate existing transactions: assign to default wallet + set type to "expense"
      const defaultWalletId = "wallet-tunai";
      await trans.table("transactions").toCollection().modify((tx) => {
        if (!tx.type) tx.type = "expense";
        if (!tx.walletId) tx.walletId = defaultWalletId;
      });
      // Migrate existing categories: assign type "expense" if missing
      await trans.table("categories").toCollection().modify((cat) => {
        if (!cat.type) cat.type = "expense";
      });
    });
  }
}

export const db = new MoneyTrackDB();

/**
 * Initialize database with default data on first run.
 * Uses deterministic IDs so defaults are never duplicated.
 */
export async function initializeDatabase(): Promise<void> {
  const now = new Date().toISOString();

  // Insert default categories if they don't exist
  const existingCatCount = await db.categories.count();
  if (existingCatCount === 0) {
    const categoriesWithTimestamp = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: now,
    }));
    await db.categories.bulkPut(categoriesWithTimestamp);
  } else {
    // Add any missing income categories to existing DBs
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db.categories.get(cat.id);
      if (!existing) {
        await db.categories.put({ ...cat, createdAt: now });
      }
    }
  }

  // Insert default settings if they don't exist
  const existingSettings = await db.settings.get(DEFAULT_SETTINGS.id);
  if (!existingSettings) {
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Insert default wallets if they don't exist
  const existingWalletCount = await db.wallets.count();
  if (existingWalletCount === 0) {
    const walletsWithTimestamp = DEFAULT_WALLETS.map((w) => ({
      ...w,
      createdAt: now,
      updatedAt: now,
    }));
    await db.wallets.bulkPut(walletsWithTimestamp);
  }
}
