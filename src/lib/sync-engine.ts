import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import type { Transaction } from "@/types/transaction";
import type { Wallet, WalletType } from "@/types/wallet";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import {
  encryptAmount,
  decryptAmount,
  encryptText,
  decryptText,
  encryptObject,
  decryptObject,
  hashUserId,
} from "@/lib/crypto";

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

interface EncryptedWalletPayload {
  name: string;
  initialBalance: number;
  type: WalletType;
  isDefault?: boolean;
  updatedAt: string;
}

export const syncEngine = {
  /**
   * Sync a single wallet to Supabase with End-to-End Encryption (AES-GCM 256-bit).
   * Sensitive fields (wallet name, initial balance, type, isDefault) are encrypted.
   */
  async syncWallet(
    wallet: Wallet,
    userIdentifier?: string | null
  ): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return false;
    }

    try {
      const secret = userIdentifier || "default_user";
      const hashedUser = await hashUserId(secret);

      // Encrypt sensitive wallet data
      const sensitiveData: EncryptedWalletPayload = {
        name: wallet.name,
        initialBalance: wallet.initialBalance,
        type: wallet.type,
        isDefault: wallet.isDefault,
        updatedAt: wallet.updatedAt || new Date().toISOString(),
      };

      const encryptedPayload = await encryptObject(sensitiveData, secret);

      const remoteId = `wallet_${wallet.id}`;
      const payload = {
        id: remoteId,
        user_id: hashedUser,
        name: encryptedPayload,
        icon: wallet.icon || "Wallet",
        color: wallet.color || "#7C3AED",
        is_default: !!wallet.isDefault,
        created_at: wallet.createdAt || new Date().toISOString(),
      };

      const { error } = await supabase.from("categories").upsert(payload);

      if (error) {
        console.warn("[SyncEngine] Failed to sync encrypted wallet to Supabase:", error.message);
        return false;
      }

      // Mark as synced locally
      await db.syncedTxnIds.put({
        id: remoteId,
        lastSyncedAt: new Date().toISOString(),
      });

      console.log("[SyncEngine] Encrypted wallet synced to Supabase:", wallet.id);
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error syncing wallet to Supabase:", err);
      return false;
    }
  },

  /**
   * Delete a wallet from Supabase and update local deletion tracking.
   */
  async deleteWallet(id: string): Promise<boolean> {
    const remoteId = `wallet_${id}`;
    try {
      await db.syncedTxnIds.delete(remoteId);
    } catch {
      // ignore
    }

    if (typeof window === "undefined" || !navigator.onLine) {
      try {
        await db.pendingDeletions.put({
          id: remoteId,
          deletedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return false;
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", remoteId);
      if (error) {
        console.warn("[SyncEngine] Failed to delete wallet from Supabase, queueing:", error.message);
        await db.pendingDeletions.put({
          id: remoteId,
          deletedAt: new Date().toISOString(),
        });
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[SyncEngine] Error deleting wallet from Supabase:", err);
      try {
        await db.pendingDeletions.put({
          id: remoteId,
          deletedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
      return false;
    }
  },

  /**
   * Sync a single transaction to Supabase with End-to-End Encryption (AES-GCM 256-bit).
   * Amount & note are strongly encrypted; wallet reference is preserved.
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

      // Encode wallet ID mapping into payment_method text field for multi-device sync
      const walletMapping = transaction.toWalletId
        ? `w:${transaction.walletId}:${transaction.toWalletId}`
        : `w:${transaction.walletId}`;

      const payload: Record<string, unknown> = {
        id: transaction.id,
        user_id: hashedUser,
        amount: encryptedAmount,
        type: transaction.type,
        category_id: transaction.categoryId,
        note: encryptedNote,
        date: transaction.date,
        payment_method: walletMapping,
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
    try {
      await db.syncedTxnIds.delete(id);
    } catch {
      // ignore
    }

    if (typeof window === "undefined" || !navigator.onLine) {
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
   * Full bidirectional sync with Deletion Reconciliation & End-to-End Encryption:
   * 1. Flush offline pending deletions (transactions & wallets).
   * 2. Sync Wallets (bidirectional E2EE: wallet names, balances, types).
   * 3. Sync Transactions (bidirectional E2EE: amounts, notes, wallet mappings).
   * 4. Sync Settings (with timestamp conflict resolution).
   */
  async syncAll(userIdentifier?: string | null): Promise<{ success: boolean; count: number; error?: string }> {
    if (typeof window === "undefined" || !navigator.onLine) {
      return { success: false, count: 0, error: "Offline" };
    }

    try {
      const secret = userIdentifier || "default_user";
      const hashedUser = await hashUserId(secret);

      console.log("[SyncEngine] Starting full encrypted sync for:", hashedUser);

      // --- 1. Flush Pending Deletions ---
      try {
        const pendingDeletes = await db.pendingDeletions.toArray();
        if (pendingDeletes.length > 0) {
          for (const pending of pendingDeletes) {
            if (pending.id.startsWith("wallet_")) {
              const { error: delErr } = await supabase
                .from("categories")
                .delete()
                .eq("id", pending.id);
              if (!delErr) {
                await db.pendingDeletions.delete(pending.id);
                await db.syncedTxnIds.delete(pending.id);
              }
            } else {
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
        }
      } catch (err) {
        console.warn("[SyncEngine] Error processing pending deletions:", err);
      }

      let totalPushed = 0;

      // --- 2. Bidirectional Wallets Sync (E2EE) ---
      try {
        const { data: remoteCategories, error: walletPullError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", hashedUser);

        if (!walletPullError && remoteCategories) {
          const remoteWalletRows = remoteCategories.filter((r) => r.id.startsWith("wallet_"));
          const remoteWalletMap = new Map(remoteWalletRows.map((r) => [r.id.replace(/^wallet_/, ""), r]));

          const localWallets = await db.wallets.toArray();
          const syncedRecords = await db.syncedTxnIds.toArray();
          const syncedIdSet = new Set(syncedRecords.map((s) => s.id));

          // 2a. Reconciliation: delete local wallets deleted remotely
          for (const localW of localWallets) {
            const remoteKey = `wallet_${localW.id}`;
            if (syncedIdSet.has(remoteKey) && !remoteWalletMap.has(localW.id)) {
              console.log("[SyncEngine] Deleting remotely removed wallet from local Dexie:", localW.id);
              await db.wallets.delete(localW.id);
              await db.syncedTxnIds.delete(remoteKey);
            }
          }

          const activeLocalWallets = await db.wallets.toArray();
          const activeLocalMap = new Map(activeLocalWallets.map((w) => [w.id, w]));

          // 2b. Push new/modified local wallets
          for (const localW of activeLocalWallets) {
            const remoteMatch = remoteWalletMap.get(localW.id);
            if (!remoteMatch) {
              const synced = await this.syncWallet(localW, secret);
              if (synced) totalPushed++;
            } else {
              const localTime = new Date(localW.updatedAt || localW.createdAt || 0).getTime();
              const remoteTime = new Date(remoteMatch.created_at || 0).getTime();
              if (localTime > remoteTime) {
                const synced = await this.syncWallet(localW, secret);
                if (synced) totalPushed++;
              }
            }
          }

          // 2c. Pull and decrypt remote wallets
          for (const remoteRow of remoteWalletRows) {
            const walletId = remoteRow.id.replace(/^wallet_/, "");
            const localMatch = activeLocalMap.get(walletId);

            const decrypted = await decryptObject<EncryptedWalletPayload>(
              remoteRow.name,
              secret,
              {
                name: "Dompet",
                initialBalance: 0,
                type: "cash",
                isDefault: remoteRow.is_default,
                updatedAt: remoteRow.created_at,
              }
            );

            const localTime = localMatch
              ? new Date(localMatch.updatedAt || localMatch.createdAt || 0).getTime()
              : 0;
            const remoteTime = new Date(decrypted.updatedAt || remoteRow.created_at || 0).getTime();

            if (!localMatch || remoteTime >= localTime) {
              const walletItem: Wallet = {
                id: walletId,
                name: decrypted.name,
                type: decrypted.type || "cash",
                initialBalance: decrypted.initialBalance || 0,
                color: remoteRow.color || "#7C3AED",
                icon: remoteRow.icon || "Wallet",
                isDefault: decrypted.isDefault ?? remoteRow.is_default ?? false,
                createdAt: remoteRow.created_at,
                updatedAt: decrypted.updatedAt || remoteRow.created_at,
              };

              await db.wallets.put(walletItem);
            }

            await db.syncedTxnIds.put({
              id: remoteRow.id,
              lastSyncedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn("[SyncEngine] Error syncing wallets:", err);
      }

      // --- 3. Bidirectional Transactions Sync (E2EE) ---
      const { data: remoteTransactions, error: pullError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", hashedUser);

      if (pullError) {
        console.warn("[SyncEngine] Failed to pull transactions from Supabase:", pullError.message);
        return { success: false, count: totalPushed, error: pullError.message };
      }

      const remoteTxList = remoteTransactions || [];
      const remoteMap = new Map(remoteTxList.map((r) => [r.id, r]));

      const localTransactions = await db.transactions.toArray();
      const syncedRecords = await db.syncedTxnIds.toArray();
      const syncedIdSet = new Set(syncedRecords.map((s) => s.id));

      // 3a. Deletion Reconciliation: Check for transactions deleted on other devices
      for (const local of localTransactions) {
        if (syncedIdSet.has(local.id) && !remoteMap.has(local.id)) {
          console.log("[SyncEngine] Deleting remotely removed transaction from local Dexie:", local.id);
          await db.transactions.delete(local.id);
          await db.syncedTxnIds.delete(local.id);
        }
      }

      // Refresh local transactions after deletion cleanup
      const activeLocalTransactions = await db.transactions.toArray();

      // 3b. Push New or Locally-Updated Transactions
      for (const local of activeLocalTransactions) {
        const remoteMatch = remoteMap.get(local.id);

        if (!remoteMatch) {
          const synced = await this.syncTransaction(local, secret);
          if (synced) totalPushed++;
        } else {
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime();
          const remoteTime = new Date(remoteMatch.updated_at || remoteMatch.created_at || 0).getTime();
          if (localTime > remoteTime) {
            const synced = await this.syncTransaction(local, secret);
            if (synced) totalPushed++;
          }
        }
      }

      // 3c. Pull & Upsert Remote Transactions into Local Dexie
      for (const remote of remoteTxList) {
        const localMatch = activeLocalTransactions.find((l) => l.id === remote.id);
        const localTime = localMatch ? new Date(localMatch.updatedAt || localMatch.createdAt || 0).getTime() : 0;
        const remoteTime = new Date(remote.updated_at || remote.created_at || 0).getTime();

        // Only overwrite local if remote is newer or item doesn't exist locally
        if (!localMatch || remoteTime >= localTime) {
          const decryptedAmount = await decryptAmount(remote.amount, secret);
          const decryptedNote = await decryptText(remote.note, secret);

          // Decode wallet mapping from payment_method if prefixed with w:
          let walletId = "wallet-tunai";
          let toWalletId: string | undefined = undefined;

          if (typeof remote.payment_method === "string" && remote.payment_method.startsWith("w:")) {
            const parts = remote.payment_method.slice(2).split(":");
            walletId = parts[0] || "wallet-tunai";
            toWalletId = parts[1] || undefined;
          } else if (remote.wallet_id) {
            walletId = remote.wallet_id;
          }

          const localItem: Transaction = {
            id: remote.id,
            amount: decryptedAmount,
            type: (remote.type as "expense" | "income" | "transfer") || "expense",
            categoryId: remote.category_id,
            walletId,
            toWalletId,
            note: decryptedNote || undefined,
            date: remote.date,
            paymentMethod: remote.payment_method && !remote.payment_method.startsWith("w:")
              ? (remote.payment_method as any)
              : undefined,
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

      // --- 4. Bidirectional Settings Sync with Timestamp Resolution ---
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
          await this.syncSettings(localSettings, secret);
        }
      } else if (localSettings) {
        await this.syncSettings(localSettings, secret);
      }

      console.log("[SyncEngine] Full sync completed successfully. Items pushed:", totalPushed);
      return { success: true, count: totalPushed };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync error";
      console.warn("[SyncEngine] Full sync failed:", message);
      return { success: false, count: 0, error: message };
    }
  },
};
