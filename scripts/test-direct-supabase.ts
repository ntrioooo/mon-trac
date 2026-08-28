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

async function testAllInserts() {
  console.log("1. Testing insert to transactions...");
  const txnId = "d0000000-0000-4000-a000-000000000001";
  const { data: d1, error: e1 } = await supabase.from("transactions").upsert({
    id: txnId,
    amount: 50000,
    type: "expense",
    category_id: "food",
    note: "Test direct connect",
    date: "2026-08-28",
    payment_method: "cash",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select();
  console.log("Transactions insert:", { data: d1, error: e1 });

  console.log("\n2. Testing insert to categories...");
  const catId = "d0000000-0000-4000-a000-000000000002";
  const { data: d2, error: e2 } = await supabase.from("categories").upsert({
    id: catId,
    name: "Makanan",
    icon: "🍔",
    color: "#F59E0B",
    is_default: true,
    created_at: new Date().toISOString(),
  }).select();
  console.log("Categories insert:", { data: d2, error: e2 });

  console.log("\n3. Testing insert to settings...");
  const setId = "d0000000-0000-4000-a000-000000000003";
  const { data: d3, error: e3 } = await supabase.from("settings").upsert({
    id: setId,
    currency: "IDR",
    monthly_budget: 3000000,
    default_payment_method: "cash",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select();
  console.log("Settings insert:", { data: d3, error: e3 });
}

testAllInserts();
