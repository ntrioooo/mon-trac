import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import {
  encryptAmount,
  decryptAmount,
  encryptText,
  decryptText,
  hashUserId,
} from "../src/lib/crypto";
import type { Transaction } from "../src/types/transaction";
import type { Settings } from "../src/types/settings";
import { DEFAULT_SETTINGS } from "../src/types/settings";

const envContent = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((l) => {
  const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
});

const supabase = createClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);

// In-memory simulated browser storage
class MockTable<T extends { id: string }> {
  private map = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.map.get(id);
  }

  async put(item: T): Promise<string> {
    this.map.set(item.id, { ...item });
    return item.id;
  }

  async bulkPut(items: T[]): Promise<void> {
    for (const item of items) {
      this.map.set(item.id, { ...item });
    }
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }

  async toArray(): Promise<T[]> {
    return Array.from(this.map.values());
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

class SimulatedBrowserStorage {
  name: string;
  transactions = new MockTable<Transaction>();
  settings = new MockTable<Settings>();
  syncedTxnIds = new MockTable<{ id: string; lastSyncedAt: string }>();
  pendingDeletions = new MockTable<{ id: string; deletedAt: string }>();

  constructor(name: string) {
    this.name = name;
  }
}

// Client sync implementation matching syncEngine
function createClientSyncEngine(clientDb: SimulatedBrowserStorage, userEmail: string) {
  return {
    async syncTransaction(transaction: Transaction) {
      const hashedUser = await hashUserId(userEmail);
      const encryptedAmount = await encryptAmount(transaction.amount, userEmail);
      const encryptedNote = await encryptText(transaction.note, userEmail);

      const payload = {
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
      if (error) throw new Error("SyncTxn failed: " + error.message);

      await clientDb.syncedTxnIds.put({
        id: transaction.id,
        lastSyncedAt: new Date().toISOString(),
      });
    },

    async deleteTransaction(id: string) {
      await clientDb.syncedTxnIds.delete(id);
      await clientDb.transactions.delete(id);
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        await clientDb.pendingDeletions.put({ id, deletedAt: new Date().toISOString() });
      }
    },

    async syncSettings(settings: Settings) {
      const hashedUser = await hashUserId(userEmail);
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
      if (error) throw new Error("SyncSettings failed: " + error.message);
    },

    async syncAll() {
      const hashedUser = await hashUserId(userEmail);

      // 1. Pending deletions
      const pendingDeletes = await clientDb.pendingDeletions.toArray();
      for (const p of pendingDeletes) {
        const { error } = await supabase.from("transactions").delete().eq("id", p.id);
        if (!error) {
          await clientDb.pendingDeletions.delete(p.id);
          await clientDb.syncedTxnIds.delete(p.id);
        }
      }

      // 2. Remote pull
      const { data: remoteTransactions, error: pullError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", hashedUser);

      if (pullError) throw new Error("Pull error: " + pullError.message);

      const remoteList = remoteTransactions || [];
      const remoteMap = new Map(remoteList.map((r) => [r.id, r]));

      // 3. Deletion reconciliation
      const localTransactions = await clientDb.transactions.toArray();
      const syncedRecords = await clientDb.syncedTxnIds.toArray();
      const syncedIdSet = new Set(syncedRecords.map((s) => s.id));

      for (const local of localTransactions) {
        if (syncedIdSet.has(local.id) && !remoteMap.has(local.id)) {
          // Deleted remotely by other browser!
          await clientDb.transactions.delete(local.id);
          await clientDb.syncedTxnIds.delete(local.id);
        }
      }

      // 4. Push new/updated local records
      const activeLocal = await clientDb.transactions.toArray();
      for (const local of activeLocal) {
        const remoteMatch = remoteMap.get(local.id);
        if (!remoteMatch) {
          await this.syncTransaction(local);
        } else {
          const localTime = new Date(local.updatedAt || 0).getTime();
          const remoteTime = new Date(remoteMatch.updated_at || 0).getTime();
          if (localTime > remoteTime) {
            await this.syncTransaction(local);
          }
        }
      }

      // 5. Pull & decrypt remote records
      for (const remote of remoteList) {
        const localMatch = activeLocal.find((l) => l.id === remote.id);
        const localTime = localMatch ? new Date(localMatch.updatedAt || 0).getTime() : 0;
        const remoteTime = new Date(remote.updated_at || 0).getTime();

        if (!localMatch || remoteTime >= localTime) {
          const decryptedAmount = await decryptAmount(remote.amount, userEmail);
          const decryptedNote = await decryptText(remote.note, userEmail);

          await clientDb.transactions.put({
            id: remote.id,
            amount: decryptedAmount,
            type: (remote.type as "expense" | "income" | "transfer") || "expense",
            categoryId: remote.category_id,
            walletId: remote.wallet_id || "wallet-tunai",
            note: decryptedNote || undefined,
            date: remote.date,
            paymentMethod: remote.payment_method || "cash",
            createdAt: remote.created_at,
            updatedAt: remote.updated_at,
          });
        }

        await clientDb.syncedTxnIds.put({
          id: remote.id,
          lastSyncedAt: new Date().toISOString(),
        });
      }

      // 6. Settings sync
      const localSettings = await clientDb.settings.get(DEFAULT_SETTINGS.id);
      const { data: remoteSettings } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", hashedUser)
        .maybeSingle();

      if (remoteSettings) {
        const localTime = new Date(localSettings?.updatedAt || 0).getTime();
        const remoteTime = new Date(remoteSettings.updated_at || 0).getTime();

        if (!localSettings || remoteTime >= localTime) {
          const budget =
            remoteSettings.monthly_budget !== null && remoteSettings.monthly_budget !== undefined
              ? Number(remoteSettings.monthly_budget)
              : undefined;

          await clientDb.settings.put({
            id: DEFAULT_SETTINGS.id,
            currency: "IDR",
            monthlyBudget: budget,
            defaultPaymentMethod: remoteSettings.default_payment_method || "cash",
            createdAt: remoteSettings.created_at,
            updatedAt: remoteSettings.updated_at,
          });
        } else if (localSettings && localTime > remoteTime) {
          await this.syncSettings(localSettings);
        }
      } else if (localSettings) {
        await this.syncSettings(localSettings);
      }
    },
  };
}

async function runTwoBrowserTest() {
  console.log("==================================================================");
  console.log("🌐 STARTING 2-BROWSER SIMULATION TEST (Browser A vs Browser B)");
  console.log("==================================================================");

  const userEmail = `user.test.${Date.now()}@example.com`;
  const userHash = await hashUserId(userEmail);
  console.log(`[Account] User: ${userEmail}`);
  console.log(`[Supabase Hash] user_id: ${userHash}\n`);

  // Initialize Browser A (e.g. Chrome / Laptop)
  const browserA_DB = new SimulatedBrowserStorage("Browser_A_Laptop");
  const browserA = createClientSyncEngine(browserA_DB, userEmail);

  // Initialize Browser B (e.g. Safari / Mobile)
  const browserB_DB = new SimulatedBrowserStorage("Browser_B_Mobile");
  const browserB = createClientSyncEngine(browserB_DB, userEmail);

  // Clean initial state in Supabase
  await supabase.from("transactions").delete().eq("user_id", userHash);
  await supabase.from("settings").delete().eq("user_id", userHash);

  // --- TEST CASE 1: Budget Synchronization ---
  console.log("🧪 TEST 1: Setting Budget on Browser A (Rp 5.000.000) and syncing to Browser B");
  const now = new Date().toISOString();
  await browserA_DB.settings.put({
    id: DEFAULT_SETTINGS.id,
    currency: "IDR",
    monthlyBudget: 5000000,
    defaultPaymentMethod: "cash",
    createdAt: now,
    updatedAt: now,
  });
  await browserA.syncSettings({
    id: DEFAULT_SETTINGS.id,
    currency: "IDR",
    monthlyBudget: 5000000,
    defaultPaymentMethod: "cash",
    createdAt: now,
    updatedAt: now,
  });

  console.log("  [Browser A] Saved Budget = Rp 5.000.000 and pushed to Supabase.");

  // Browser B connects & syncs
  await browserB.syncAll();
  const browserB_Settings = await browserB_DB.settings.get(DEFAULT_SETTINGS.id);
  console.log(`  [Browser B] After syncAll, Budget = Rp ${browserB_Settings?.monthlyBudget?.toLocaleString("id-ID")}`);

  if (browserB_Settings?.monthlyBudget !== 5000000) {
    throw new Error(`TEST 1 FAILED: Expected 5.000.000 on Browser B, got ${browserB_Settings?.monthlyBudget}`);
  }
  console.log("  ✅ TEST 1 PASSED: Budget synced seamlessly between Browser A and Browser B!\n");

  // --- TEST CASE 2: Transaction Creation from Browser A to Browser B ---
  console.log("🧪 TEST 2: Adding 2 Transactions on Browser A -> Syncing to Browser B");
  const tx1: Transaction = {
    id: "tx-coffee-" + Date.now(),
    amount: 35000,
    type: "expense",
    categoryId: "cat-minuman",
    walletId: "wallet-tunai",
    note: "Kopi Kenangan Mantan",
    date: "2026-08-28",
    paymentMethod: "ewallet",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tx2: Transaction = {
    id: "tx-lunch-" + Date.now(),
    amount: 65000,
    type: "expense",
    categoryId: "cat-makanan",
    walletId: "wallet-tunai",
    note: "Nasi Padang Rendang",
    date: "2026-08-28",
    paymentMethod: "cash",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await browserA_DB.transactions.bulkPut([tx1, tx2]);
  await browserA.syncTransaction(tx1);
  await browserA.syncTransaction(tx2);
  console.log("  [Browser A] Created & pushed 2 transactions (Kopi: 35k, Nasi Padang: 65k).");

  // Browser B syncs
  await browserB.syncAll();
  const browserB_Txns = await browserB_DB.transactions.toArray();
  console.log(`  [Browser B] Pulled transactions count: ${browserB_Txns.length}`);
  for (const t of browserB_Txns) {
    console.log(`    - [Browser B Record] Note: "${t.note}", Amount: Rp ${t.amount.toLocaleString("id-ID")}, Payment: ${t.paymentMethod}`);
  }

  if (browserB_Txns.length !== 2) {
    throw new Error(`TEST 2 FAILED: Expected 2 transactions on Browser B, found ${browserB_Txns.length}`);
  }
  console.log("  ✅ TEST 2 PASSED: Encrypted transactions pulled & decrypted on Browser B!\n");

  // --- TEST CASE 3: Transaction Deletion on Browser A -> Reconciled on Browser B ---
  console.log("🧪 TEST 3: Deleting 'Nasi Padang' on Browser A -> Verifying Browser B auto-deletes without resurrection");
  await browserA.deleteTransaction(tx2.id);
  console.log("  [Browser A] Deleted 'Nasi Padang' locally and from Supabase.");

  // Browser B syncs
  console.log("  [Browser B] Triggering syncAll()...");
  await browserB.syncAll();
  const browserB_AfterDelete = await browserB_DB.transactions.toArray();
  console.log(`  [Browser B] Remaining transactions count: ${browserB_AfterDelete.length}`);

  const hasNasiPadangOnB = browserB_AfterDelete.some((t) => t.id === tx2.id);
  if (hasNasiPadangOnB) {
    throw new Error("TEST 3 FAILED: 'Nasi Padang' still exists on Browser B!");
  }
  console.log("  [Browser B] 'Nasi Padang' was automatically deleted by reconciliation.");

  // Browser A refreshes / syncs again
  console.log("  [Browser A] Refreshing / syncAll()...");
  await browserA.syncAll();
  const browserA_AfterSync = await browserA_DB.transactions.toArray();
  console.log(`  [Browser A] Remaining transactions count: ${browserA_AfterSync.length}`);

  const hasResurrectedOnA = browserA_AfterSync.some((t) => t.id === tx2.id);
  if (hasResurrectedOnA) {
    throw new Error("TEST 3 FAILED: Resurrection occurred! 'Nasi Padang' reappeared on Browser A!");
  }

  // Verify Supabase Cloud state
  const { data: cloudTxns } = await supabase.from("transactions").select("*").eq("user_id", userHash);
  console.log(`  [Cloud Supabase] Remaining transactions in DB: ${cloudTxns?.length}`);

  if (cloudTxns?.length !== 1 || cloudTxns[0].id !== tx1.id) {
    throw new Error(`TEST 3 FAILED: Expected exactly 1 transaction in Cloud, found ${cloudTxns?.length}`);
  }

  console.log("  ✅ TEST 3 PASSED: Zero resurrection! Deletions propagated cleanly across browsers!\n");

  // --- TEST CASE 4: Browser B adds a new transaction -> Browser A pulls it ---
  console.log("🧪 TEST 4: Browser B creates a new transaction -> Browser A pulls it");
  const tx3: Transaction = {
    id: "tx-boba-" + Date.now(),
    amount: 28000,
    type: "expense",
    categoryId: "cat-minuman",
    walletId: "wallet-tunai",
    note: "Boba Brown Sugar Milk",
    date: "2026-08-28",
    paymentMethod: "ewallet",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await browserB_DB.transactions.put(tx3);
  await browserB.syncTransaction(tx3);
  console.log("  [Browser B] Created & pushed 'Boba Brown Sugar Milk' (28k).");

  // Browser A syncs
  await browserA.syncAll();
  const browserA_Final = await browserA_DB.transactions.toArray();
  console.log(`  [Browser A] Total transactions: ${browserA_Final.length}`);
  const hasBobaOnA = browserA_Final.some((t) => t.id === tx3.id);

  if (!hasBobaOnA || browserA_Final.length !== 2) {
    throw new Error(`TEST 4 FAILED: Browser A failed to pull 'Boba Brown Sugar Milk'!`);
  }
  console.log("  ✅ TEST 4 PASSED: Browser A successfully received new data from Browser B!\n");

  // Cleanup test data
  await supabase.from("transactions").delete().eq("user_id", userHash);
  await supabase.from("settings").delete().eq("user_id", userHash);

  console.log("==================================================================");
  console.log("🎉 ALL 4 MULTI-BROWSER TESTS PASSED (100% SUCCESS)!");
  console.log("==================================================================");
}

runTwoBrowserTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
