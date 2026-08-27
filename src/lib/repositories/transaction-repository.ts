import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types/transaction";
import { encryptAmount, decryptAmount } from "@/lib/crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function toTransaction(row: any, userSecret: string): Promise<Transaction> {
  const amount = await decryptAmount(row.amount, userSecret);
  return {
    id: row.id,
    amount,
    type: row.type,
    categoryId: row.category_id,
    note: row.note ?? undefined,
    date: row.date,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const transactionRepository = {
  async create(transaction: Transaction): Promise<string> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const encryptedAmount = await encryptAmount(transaction.amount, user.id);
    const now = new Date().toISOString();

    const { error } = await supabase.from("transactions").insert({
      id: transaction.id,
      user_id: user.id,
      amount: encryptedAmount,
      type: transaction.type,
      category_id: transaction.categoryId,
      note: transaction.note || null,
      date: transaction.date,
      payment_method: transaction.paymentMethod,
      created_at: transaction.createdAt || now,
      updated_at: transaction.updatedAt || now,
    });

    if (error) throw error;
    return transaction.id;
  },

  async update(id: string, data: Partial<Transaction>): Promise<number> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.amount !== undefined) {
      updatePayload.amount = await encryptAmount(data.amount, user.id);
    }
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId;
    if (data.note !== undefined) updatePayload.note = data.note;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.paymentMethod !== undefined) updatePayload.payment_method = data.paymentMethod;

    const { error } = await supabase
      .from("transactions")
      .update(updatePayload)
      .eq("id", id);

    if (error) throw error;
    return 1;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  },

  async getById(id: string): Promise<Transaction | undefined> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return undefined;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return await toTransaction(data, user.id);
  },

  async getAll(): Promise<Transaction[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error.message);
      return [];
    }

    return await Promise.all((data ?? []).map((row) => toTransaction(row, user.id)));
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions by date range:", error.message);
      return [];
    }

    return await Promise.all((data ?? []).map((row) => toTransaction(row, user.id)));
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return this.getByDateRange(startDate, endDate);
  },

  async getByCategoryId(categoryId: string): Promise<Transaction[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("category_id", categoryId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions by category:", error.message);
      return [];
    }

    return await Promise.all((data ?? []).map((row) => toTransaction(row, user.id)));
  },

  async count(): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    if (error) return 0;
    return count ?? 0;
  },

  async clear(): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("transactions").delete().eq("user_id", user.id);
  },
};
