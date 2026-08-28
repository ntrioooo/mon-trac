import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const url = env["NEXT_PUBLIC_SUPABASE_URL"];
const key = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

console.log("Supabase URL:", url);
console.log("Supabase Key:", key ? `${key.slice(0, 10)}...` : "none");

const supabase = createClient(url, key);

async function test() {
  try {
    const { data: txns, error: txnError } = await supabase.from("transactions").select("*").limit(1);
    console.log("Transactions table:", txnError ? `Error: ${txnError.message}` : "Success (table exists)");
    
    const { data: cats, error: catError } = await supabase.from("categories").select("*").limit(1);
    console.log("Categories table:", catError ? `Error: ${catError.message}` : "Success (table exists)");

    const { data: sets, error: setError } = await supabase.from("settings").select("*").limit(1);
    console.log("Settings table:", setError ? `Error: ${setError.message}` : "Success (table exists)");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
