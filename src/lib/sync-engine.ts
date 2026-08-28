import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import type { Settings } from "@/types/settings";

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export const syncEngine = {
  /**
   * Sync a single transaction to Supabase immediately.
   */
  async syncTransaction(transaction: Transaction, userIdentifier?: string | null): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return false;
    }

    try {
      const payload: Record<string, unknown> = {
        id: transaction.id,
        user_id: userIdentifier || "default_user",
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.categoryId,
        note: transaction.note || null,
        date: transaction.date,
        payment_method: transaction.paymentMethod,
        created_at: transaction.createdAt || new Date().toISOString(),
        updated_at: transaction.updatedAt || new Date().toISOString(),
      };

      const { error } = await supabase.from("transactions").upsert(payload);

      if (error) {
        console.warn("[SyncEngine] Failed to sync transaction to Supabase:", error.message);
        return false;
      }

      console.log("[SyncEngine] Transaction synced to Supabase:", transaction.id);
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error syncing transaction to Supabase:", err);
      return false;
    }
  },

  /**
   * Delete a transaction from Supabase.
   */
  async deleteTransaction(id: string): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return false;
    }

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        console.warn("[SyncEngine] Failed to delete from Supabase:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error deleting from Supabase:", err);
      return false;
    }
  },

  /**
   * Sync settings to Supabase.
   */
  async syncSettings(settings: Settings, userIdentifier?: string | null): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) return false;
    try {
      const { error } = await supabase.from("settings").upsert({
        id: settings.id || "default_settings",
        user_id: userIdentifier || "default_user",
        currency: settings.currency || "IDR",
        monthly_budget: settings.monthlyBudget || null,
        default_payment_method: settings.defaultPaymentMethod || "cash",
        created_at: settings.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Full bidirectional sync:
   * 1. Push all local data to Supabase.
   * 2. Pull remote records from Supabase into local Dexie.
   */
  async syncAll(userIdentifier?: string | null): Promise<{ success: boolean; count: number; error?: string }> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return { success: false, count: 0, error: "Offline" };
    }

    try {
      const userId = userIdentifier || "default_user";
      console.log("[SyncEngine] Starting full sync for user:", userId);

      // 1. Push local transactions
      const localTransactions = await db.transactions.toArray();
      let pushedCount = 0;

      for (const t of localTransactions) {
        const synced = await this.syncTransaction(t, userId);
        if (synced) pushedCount++;
      }

      // 2. Pull remote transactions
      const { data: remoteTransactions, error: pullError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId);

      if (pullError) {
        console.warn("[SyncEngine] Failed to pull from Supabase:", pullError.message);
        return { success: false, count: pushedCount, error: pullError.message };
      }

      if (remoteTransactions && remoteTransactions.length > 0) {
        for (const remote of remoteTransactions) {
          const localItem: Transaction = {
            id: remote.id,
            amount: Number(remote.amount),
            type: "expense",
            categoryId: remote.category_id,
            note: remote.note || undefined,
            date: remote.date,
            paymentMethod: (remote.payment_method as "cash" | "bank" | "debit" | "credit" | "ewallet") || "cash",
            createdAt: remote.created_at,
            updatedAt: remote.updated_at,
          };
          await db.transactions.put(localItem);
        }
      }

      console.log("[SyncEngine] Full sync completed successfully. Synced:", pushedCount);
      return { success: true, count: pushedCount };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync error";
      console.warn("[SyncEngine] Full sync failed:", message);
      return { success: false, count: 0, error: message };
    }
  },
};
