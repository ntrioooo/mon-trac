import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);

async function verifySupabase() {
  console.log("▶ 1. Inserting test transaction to Supabase...");
  const txnId = "verify-txn-" + Date.now();
  const { data: d1, error: e1 } = await supabase.from("transactions").upsert({
    id: txnId,
    user_id: "user_test_google_123",
    amount: 75000,
    type: "expense",
    category_id: "cat_food",
    note: "Tes Makan Siang Cloud Sync",
    date: "2026-08-28",
    payment_method: "gopay",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select();

  console.log("Transaction Insert:", e1 ? `FAILED: ${e1.message}` : `SUCCESS: Inserted 1 row! ID = ${txnId}`);

  console.log("\n▶ 2. Inserting test category to Supabase...");
  const catId = "verify-cat-" + Date.now();
  const { data: d2, error: e2 } = await supabase.from("categories").upsert({
    id: catId,
    user_id: "user_test_google_123",
    name: "Makanan",
    icon: "🍜",
    color: "#F59E0B",
    is_default: true,
  }).select();

  console.log("Category Insert:", e2 ? `FAILED: ${e2.message}` : `SUCCESS: Inserted 1 row! ID = ${catId}`);

  console.log("\n▶ 3. Inserting test settings to Supabase...");
  const setId = "verify-set-" + Date.now();
  const { data: d3, error: e3 } = await supabase.from("settings").upsert({
    id: setId,
    user_id: "user_test_google_123",
    currency: "IDR",
    monthly_budget: 3500000,
    default_payment_method: "cash",
  }).select();

  console.log("Settings Insert:", e3 ? `FAILED: ${e3.message}` : `SUCCESS: Inserted 1 row! ID = ${setId}`);

  console.log("\n▶ 4. Querying all data in transactions table...");
  const { data: allTxns, error: qErr } = await supabase.from("transactions").select("*");
  console.log("Total Transactions in Supabase:", allTxns?.length || 0);
  console.log("Transactions data preview:", allTxns);
}

verifySupabase();
