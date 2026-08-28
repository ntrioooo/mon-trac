import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { encryptAmount, decryptAmount } from "../src/lib/crypto";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);

async function testEncrypted() {
  const userSecret = "user_secret_key_12345";
  const rawAmount = 150000;

  console.log("Original Amount:", rawAmount);
  const encryptedAmount = await encryptAmount(rawAmount, userSecret);
  console.log("Encrypted Amount:", encryptedAmount);

  const decrypted = await decryptAmount(encryptedAmount, userSecret);
  console.log("Decrypted back:", decrypted);

  const testId = "enc-test-" + Date.now();
  const { data, error } = await supabase.from("transactions").upsert({
    id: testId,
    user_id: "hashed_user_id_12345",
    amount: encryptedAmount,
    type: "expense",
    category_id: "food",
    note: "Encrypted transaction test",
    date: "2026-08-28",
    payment_method: "cash",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select();

  console.log("Supabase insert with encrypted amount:", { data, error });
}

testEncrypted();
