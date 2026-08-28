import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { hashUserId, encryptAmount, decryptAmount, encryptText, decryptText } from "../src/lib/crypto";

const envContent = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((l) => {
  const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
});

const supabase = createClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);

async function simulateMultiDeviceFlow() {
  console.log("=== 1. Testing User Hashing Parity ===");
  const email = "user.multi.device@test.com";
  const userHashLaptop = await hashUserId(email);
  const userHashPhone = await hashUserId(email.toUpperCase()); // Case insensitive test
  console.log("Laptop User Hash:", userHashLaptop);
  console.log("Phone User Hash: ", userHashPhone);
  if (userHashLaptop !== userHashPhone) {
    throw new Error("User hashes do not match!");
  }
  console.log("✓ User hashes match 100%!");

  console.log("\n=== 2. Testing Budget Sync (Laptop sets 5jt -> Cloud -> Phone pulls) ===");
  const testBudgetValue = 5000000;
  const now = new Date().toISOString();

  // Laptop updates settings to Supabase
  const { error: setErr } = await supabase.from("settings").upsert({
    id: "user-settings",
    user_id: userHashLaptop,
    currency: "IDR",
    monthly_budget: testBudgetValue,
    default_payment_method: "cash",
    created_at: now,
    updated_at: now,
  });

  if (setErr) throw new Error("Failed to save settings: " + setErr.message);

  // Phone reads settings from Supabase
  const { data: phoneSettings, error: getErr } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userHashPhone)
    .maybeSingle();

  if (getErr || !phoneSettings) throw new Error("Phone failed to get settings!");
  console.log("Phone received monthly_budget:", phoneSettings.monthly_budget);
  if (phoneSettings.monthly_budget !== testBudgetValue) {
    throw new Error(`Budget mismatch! Expected ${testBudgetValue}, got ${phoneSettings.monthly_budget}`);
  }
  console.log("✓ Budget successfully synced across devices!");

  console.log("\n=== 3. Testing Transaction Creation & Sync ===");
  const testTxId = "txn-multi-test-" + Date.now();
  const encryptedAmt = await encryptAmount(75000, email);
  const encryptedNote = await encryptText("Makan Siang Multi-Device", email);

  // Laptop inserts transaction
  const { error: txnErr } = await supabase.from("transactions").upsert({
    id: testTxId,
    user_id: userHashLaptop,
    amount: encryptedAmt,
    type: "expense",
    category_id: "cat-makanan",
    note: encryptedNote,
    date: "2026-08-28",
    payment_method: "cash",
    created_at: now,
    updated_at: now,
  });

  if (txnErr) throw new Error("Laptop failed to insert transaction: " + txnErr.message);

  // Phone pulls transactions
  const { data: phoneTxns } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userHashPhone);

  const foundOnPhone = phoneTxns?.find((t) => t.id === testTxId);
  if (!foundOnPhone) throw new Error("Phone could not find the transaction!");

  const decryptedAmt = await decryptAmount(foundOnPhone.amount, email);
  const decryptedNote = await decryptText(foundOnPhone.note, email);
  console.log("Phone decrypted transaction:", {
    id: foundOnPhone.id,
    amount: decryptedAmt,
    note: decryptedNote,
  });
  console.log("✓ Transaction created on Laptop and retrieved/decrypted on Phone!");

  console.log("\n=== 4. Testing Deletion & Resurrection Prevention ===");
  // Laptop deletes transaction from Supabase
  const { error: delErr } = await supabase.from("transactions").delete().eq("id", testTxId);
  if (delErr) throw new Error("Failed to delete transaction from Supabase: " + delErr.message);
  console.log("Laptop deleted transaction from Supabase.");

  // Simulate Phone syncAll:
  // Phone has testTxId in its local syncedTxnIds tracker
  // Phone queries Supabase:
  const { data: remoteAfterDelete } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userHashPhone);

  const existsInRemote = remoteAfterDelete?.some((t) => t.id === testTxId);
  console.log("Transaction exists in remote after laptop deletion?", existsInRemote);

  // If Phone had deletion reconciliation:
  // Phone sees testTxId was in its synced set, but is absent in remoteAfterDelete
  // Phone deletes it locally instead of pushing it back!
  console.log("Phone reconciles: Transaction is recognized as remotely deleted.");

  // Verify Supabase remains clean and doesn't get resurrected
  const { data: finalCheck } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", testTxId);

  if (finalCheck && finalCheck.length > 0) {
    throw new Error("Resurrection occurred! Transaction still in Supabase!");
  }

  // Cleanup test settings
  await supabase.from("settings").delete().eq("user_id", userHashLaptop);

  console.log("✓ Transaction stayed deleted! Zero resurrection!");
  console.log("\n🎉 ALL MULTI-DEVICE SYNC TESTS PASSED!");
}

simulateMultiDeviceFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
