import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import type { Transaction } from "@/types/transaction";
import type { Settings } from "@/types/settings";
import {
  encryptAmount,
  decryptAmount,
  encryptText,
  decryptText,
  hashUserId,
} from "@/lib/crypto";

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export const syncEngine = {
  /**
   * Sync a single transaction to Supabase with End-to-End Encryption (AES-GCM 256-bit).
   */
  async syncTransaction(transaction: Transaction, userIdentifier?: string | null): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return false;
    }

    try {
      const secret = userIdentifier || "default_local_secret";
      const hashedUser = await hashUserId(secret);
      const encryptedAmount = await encryptAmount(transaction.amount, secret);
      const encryptedNote = await encryptText(transaction.note, secret);

      const payload: Record<string, unknown> = {
        id: transaction.id,
        user_id: hashedUser,
        amount: encryptedAmount,
        type: transaction.type,
        category_id: transaction.categoryId,
        note: encryptedNote,
        date: transaction.date,
        payment_method: transaction.paymentMethod,
        created_at: transaction.createdAt || new Date().toISOString(),
        updated_at: transaction.updatedAt || new Date().toISOString(),
      };

      const { error } = await supabase.from("transactions").upsert(payload);

      if (error) {
        console.warn("[SyncEngine] Failed to sync encrypted transaction to Supabase:", error.message);
        return false;
      }

      console.log("[SyncEngine] Encrypted transaction synced to Supabase:", transaction.id);
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
   * Sync settings (including monthlyBudget) to Supabase.
   */
  async syncSettings(settings: Settings, userIdentifier?: string | null): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) return false;
    try {
      const secret = userIdentifier || "default_local_secret";
      const hashedUser = await hashUserId(secret);

      const { error } = await supabase.from("settings").upsert({
        id: settings.id || "default_settings",
        user_id: hashedUser,
        currency: settings.currency || "IDR",
        monthly_budget: settings.monthlyBudget ? Number(settings.monthlyBudget) : null,
        default_payment_method: settings.defaultPaymentMethod || "cash",
        created_at: settings.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn("[SyncEngine] Failed to sync settings to Supabase:", error.message);
        return false;
      }

      console.log("[SyncEngine] Settings synced to Supabase successfully.");
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error syncing settings:", err);
      return false;
    }
  },

  /**
   * Full bidirectional sync:
   * 1. Push all local transactions & settings to Supabase (encrypted).
   * 2. Pull remote records from Supabase into local Dexie (decrypted client-side).
   * 3. Pull remote settings from Supabase into local Dexie.
   */
  async syncAll(userIdentifier?: string | null): Promise<{ success: boolean; count: number; error?: string }> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return { success: false, count: 0, error: "Offline" };
    }

    try {
      const secret = userIdentifier || "default_local_secret";
      const hashedUser = await hashUserId(secret);

      console.log("[SyncEngine] Starting full encrypted sync for user:", hashedUser);

      // 1. Push local transactions
      const localTransactions = await db.transactions.toArray();
      let pushedCount = 0;

      for (const t of localTransactions) {
        const synced = await this.syncTransaction(t, secret);
        if (synced) pushedCount++;
      }

      // 2. Push local settings
      const localSettings = await db.settings.get("default_settings");
      if (localSettings) {
        await this.syncSettings(localSettings, secret);
      }

      // 3. Pull remote transactions
      const { data: remoteTransactions, error: pullError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", hashedUser);

      if (pullError) {
        console.warn("[SyncEngine] Failed to pull transactions from Supabase:", pullError.message);
        return { success: false, count: pushedCount, error: pullError.message };
      }

      if (remoteTransactions && remoteTransactions.length > 0) {
        for (const remote of remoteTransactions) {
          const decryptedAmount = await decryptAmount(remote.amount, secret);
          const decryptedNote = await decryptText(remote.note, secret);

          const localItem: Transaction = {
            id: remote.id,
            amount: decryptedAmount,
            type: "expense",
            categoryId: remote.category_id,
            note: decryptedNote || undefined,
            date: remote.date,
            paymentMethod: (remote.payment_method as "cash" | "bank" | "debit" | "credit" | "ewallet") || "cash",
            createdAt: remote.created_at,
            updatedAt: remote.updated_at,
          };
          await db.transactions.put(localItem);
        }
      }

      // 4. Pull remote settings (including monthly_budget)
      const { data: remoteSettings, error: settingsPullError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", hashedUser)
        .maybeSingle();

      if (settingsPullError) {
        console.warn("[SyncEngine] Failed to pull settings from Supabase:", settingsPullError.message);
      } else if (remoteSettings) {
        const remoteBudget = remoteSettings.monthly_budget !== null && remoteSettings.monthly_budget !== undefined
          ? Number(remoteSettings.monthly_budget)
          : undefined;

        await db.settings.put({
          id: "default_settings",
          currency: remoteSettings.currency || "IDR",
          monthlyBudget: remoteBudget,
          defaultPaymentMethod: remoteSettings.default_payment_method || "cash",
          createdAt: remoteSettings.created_at || new Date().toISOString(),
          updatedAt: remoteSettings.updated_at || new Date().toISOString(),
        });
        console.log("[SyncEngine] Remote settings pulled and updated locally. Budget:", remoteBudget);
      }

      console.log("[SyncEngine] Full sync completed successfully. Transactions pushed:", pushedCount);
      return { success: true, count: pushedCount };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync error";
      console.warn("[SyncEngine] Full sync failed:", message);
      return { success: false, count: 0, error: message };
    }
  },
};
