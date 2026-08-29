import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import type { Transaction } from "@/types/transaction";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
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
  async syncTransaction(
    transaction: Transaction,
    userIdentifier?: string | null
  ): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return false;
    }

    try {
      const secret = userIdentifier || "default_user";
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

      // Mark as synced locally
      await db.syncedTxnIds.put({
        id: transaction.id,
        lastSyncedAt: new Date().toISOString(),
      });

      console.log("[SyncEngine] Encrypted transaction synced to Supabase:", transaction.id);
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error syncing transaction to Supabase:", err);
      return false;
    }
  },

  /**
   * Delete a transaction from Supabase and update local deletion tracking.
   */
  async deleteTransaction(id: string): Promise<boolean> {
    // 1. Remove from local synced tracker
    try {
      await db.syncedTxnIds.delete(id);
    } catch {
      // ignore
    }

    if (typeof window === "undefined" || !navigator.onLine) {
      // Queue deletion for when connection returns
      try {
        await db.pendingDeletions.put({
          id,
          deletedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return false;
    }

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        console.warn("[SyncEngine] Failed to delete from Supabase, queueing for retry:", error.message);
        await db.pendingDeletions.put({
          id,
          deletedAt: new Date().toISOString(),
        });
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error deleting from Supabase:", err);
      try {
        await db.pendingDeletions.put({
          id,
          deletedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return false;
    }
  },

  /**
   * Sync settings (including monthlyBudget) to Supabase.
   */
  async syncSettings(settings: Settings, userIdentifier?: string | null): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) return false;
    try {
      const secret = userIdentifier || "default_user";
      const hashedUser = await hashUserId(secret);

      const payload = {
        id: DEFAULT_SETTINGS.id,
        user_id: hashedUser,
        currency: settings.currency || "IDR",
        monthly_budget: settings.monthlyBudget ? Number(settings.monthlyBudget) : null,
        default_payment_method: settings.defaultPaymentMethod || "cash",
        created_at: settings.createdAt || new Date().toISOString(),
        updated_at: settings.updatedAt || new Date().toISOString(),
      };

      const { error } = await supabase.from("settings").upsert(payload);

      if (error) {
        console.warn("[SyncEngine] Failed to sync settings to Supabase:", error.message);
        return false;
      }

      console.log("[SyncEngine] Settings synced to Supabase successfully. Budget:", settings.monthlyBudget);
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error syncing settings:", err);
      return false;
    }
  },

  /**
   * Full bidirectional sync with Deletion Reconciliation:
   * 1. Flush offline pending deletions to Supabase.
   * 2. Fetch remote transactions & detect remote deletions (delete local rows if removed remotely).
   * 3. Push new/modified local transactions to Supabase.
   * 4. Pull & decrypt remote transactions to local Dexie.
   * 5. Sync Settings with timestamp-based conflict resolution.
   */
  async syncAll(userIdentifier?: string | null): Promise<{ success: boolean; count: number; error?: string }> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return { success: false, count: 0, error: "Offline" };
    }

    try {
      const secret = userIdentifier || "default_user";
      const hashedUser = await hashUserId(secret);

      console.log("[SyncEngine] Starting full encrypted sync with deletion reconciliation for:", hashedUser);

      // --- 1. Flush Pending Deletions ---
      try {
        const pendingDeletes = await db.pendingDeletions.toArray();
        if (pendingDeletes.length > 0) {
          for (const pending of pendingDeletes) {
            const { error: delErr } = await supabase
              .from("transactions")
              .delete()
              .eq("id", pending.id);
            if (!delErr) {
              await db.pendingDeletions.delete(pending.id);
              await db.syncedTxnIds.delete(pending.id);
            }
          }
        }
      } catch (err) {
        console.warn("[SyncEngine] Error processing pending deletions:", err);
      }

      // --- 2. Pull Remote Transactions ---
      const { data: remoteTransactions, error: pullError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", hashedUser);

      if (pullError) {
        console.warn("[SyncEngine] Failed to pull transactions from Supabase:", pullError.message);
        return { success: false, count: 0, error: pullError.message };
      }

      const remoteTxList = remoteTransactions || [];
      const remoteMap = new Map(remoteTxList.map((r) => [r.id, r]));

      const localTransactions = await db.transactions.toArray();
      const syncedRecords = await db.syncedTxnIds.toArray();
      const syncedIdSet = new Set(syncedRecords.map((s) => s.id));

      // --- 3. Deletion Reconciliation: Check for transactions deleted on other devices ---
      for (const local of localTransactions) {
        // If this local transaction was previously synced, but is now absent from remote Supabase,
        // it means another device deleted it. Delete it locally!
        if (syncedIdSet.has(local.id) && !remoteMap.has(local.id)) {
          console.log("[SyncEngine] Deleting remotely removed transaction from local Dexie:", local.id);
          await db.transactions.delete(local.id);
          await db.syncedTxnIds.delete(local.id);
        }
      }

      // Refresh local transactions after deletion cleanup
      const activeLocalTransactions = await db.transactions.toArray();
      let pushedCount = 0;

      // --- 4. Push New or Locally-Updated Transactions ---
      for (const local of activeLocalTransactions) {
        const remoteMatch = remoteMap.get(local.id);

        if (!remoteMatch) {
          // Newly created locally (or not yet known to Supabase)
          const synced = await this.syncTransaction(local, secret);
          if (synced) pushedCount++;
        } else {
          // If local has newer timestamp than remote, push update
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime();
          const remoteTime = new Date(remoteMatch.updated_at || remoteMatch.created_at || 0).getTime();
          if (localTime > remoteTime) {
            const synced = await this.syncTransaction(local, secret);
            if (synced) pushedCount++;
          }
        }
      }

      // --- 5. Pull & Upsert Remote Transactions into Local Dexie ---
      for (const remote of remoteTxList) {
        const localMatch = activeLocalTransactions.find((l) => l.id === remote.id);
        const localTime = localMatch ? new Date(localMatch.updatedAt || localMatch.createdAt || 0).getTime() : 0;
        const remoteTime = new Date(remote.updated_at || remote.created_at || 0).getTime();

        // Only overwrite local if remote is newer or item doesn't exist locally
        if (!localMatch || remoteTime >= localTime) {
          const decryptedAmount = await decryptAmount(remote.amount, secret);
          const decryptedNote = await decryptText(remote.note, secret);

          const localItem: Transaction = {
            id: remote.id,
            amount: decryptedAmount,
            type: (remote.type as "expense" | "income" | "transfer") || "expense",
            categoryId: remote.category_id,
            walletId: remote.wallet_id || "wallet-tunai",
            note: decryptedNote || undefined,
            date: remote.date,
            paymentMethod: (remote.payment_method as "cash" | "bank" | "debit" | "credit" | "ewallet") || "cash",
            createdAt: remote.created_at,
            updatedAt: remote.updated_at,
          };
          await db.transactions.put(localItem);
        }

        // Always register as synced
        await db.syncedTxnIds.put({
          id: remote.id,
          lastSyncedAt: new Date().toISOString(),
        });
      }

      // --- 6. Bidirectional Settings Sync with Timestamp Resolution ---
      const localSettings = await db.settings.get(DEFAULT_SETTINGS.id);
      const { data: remoteSettings, error: settingsPullError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", hashedUser)
        .maybeSingle();

      if (settingsPullError) {
        console.warn("[SyncEngine] Failed to pull settings from Supabase:", settingsPullError.message);
      } else if (remoteSettings) {
        const localTime = new Date(localSettings?.updatedAt || localSettings?.createdAt || 0).getTime();
        const remoteTime = new Date(remoteSettings.updated_at || remoteSettings.created_at || 0).getTime();

        if (!localSettings || remoteTime >= localTime) {
          const remoteBudget =
            remoteSettings.monthly_budget !== null && remoteSettings.monthly_budget !== undefined
              ? Number(remoteSettings.monthly_budget)
              : undefined;

          await db.settings.put({
            id: DEFAULT_SETTINGS.id,
            currency: remoteSettings.currency || "IDR",
            monthlyBudget: remoteBudget,
            defaultPaymentMethod: (remoteSettings.default_payment_method as any) || "cash",
            createdAt: remoteSettings.created_at || new Date().toISOString(),
            updatedAt: remoteSettings.updated_at || new Date().toISOString(),
          });
          console.log("[SyncEngine] Remote settings pulled and applied locally. Budget:", remoteBudget);
        } else if (localSettings && localTime > remoteTime) {
          // Local settings are newer: push to cloud
          await this.syncSettings(localSettings, secret);
        }
      } else if (localSettings) {
        // No remote settings yet: push local settings
        await this.syncSettings(localSettings, secret);
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
