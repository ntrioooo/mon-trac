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

async function testInsertUUID() {
  const now = new Date().toISOString();
  const testId = "11111111-1111-4111-a111-111111111111";
  const testUserId = "22222222-2222-4222-a222-222222222222";

  const { data, error } = await supabase.from("transactions").insert({
    id: testId,
    user_id: testUserId,
    amount: "50000", // amount might be string or encrypted or number
    type: "expense",
    category_id: "food",
    note: "Test cloud sync",
    date: "2026-08-28",
    payment_method: "cash",
    created_at: now,
    updated_at: now,
  }).select();

  console.log("Insert result:", data, "Error:", error);

  if (!error) {
    await supabase.from("transactions").delete().eq("id", testId);
    console.log("Test record cleaned up successfully.");
  }
}

testInsertUUID();
