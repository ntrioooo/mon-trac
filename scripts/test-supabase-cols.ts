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

async function checkColumns() {
  const { data: txn, error: err1 } = await supabase.from("transactions").select("*").limit(1);
  console.log("Txn sample:", txn, "Error:", err1);

  const { data: cat, error: err2 } = await supabase.from("categories").select("*").limit(1);
  console.log("Cat sample:", cat, "Error:", err2);

  const { data: set, error: err3 } = await supabase.from("settings").select("*").limit(1);
  console.log("Set sample:", set, "Error:", err3);
}

checkColumns();
