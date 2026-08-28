import Dexie, { type Table } from "dexie";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import type { Settings } from "@/types/settings";
import { DEFAULT_CATEGORIES } from "@/types/category";
import { DEFAULT_SETTINGS } from "@/types/settings";

export class MoneyTrackDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  settings!: Table<Settings, string>;
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
  const existingCategories = await db.categories.count();
  if (existingCategories === 0) {
    const categoriesWithTimestamp = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: now,
    }));
    await db.categories.bulkPut(categoriesWithTimestamp);
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
}
