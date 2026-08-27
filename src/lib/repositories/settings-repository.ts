import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { PaymentMethod } from "@/types/transaction";

export const settingsRepository = {
  async get(): Promise<Settings> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      return {
        ...DEFAULT_SETTINGS,
        id: user.id,
      };
    }

    return {
      id: data.user_id,
      currency: (data.currency as "IDR") ?? "IDR",
      monthlyBudget: data.monthly_budget ? Number(data.monthly_budget) : undefined,
      defaultPaymentMethod: (data.default_payment_method as PaymentMethod) ?? "cash",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(data: Partial<Settings>): Promise<number> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const now = new Date().toISOString();
    const upsertPayload: Record<string, unknown> = {
      user_id: user.id,
      updated_at: now,
    };

    if (data.currency !== undefined) upsertPayload.currency = data.currency;
    if (data.monthlyBudget !== undefined) upsertPayload.monthly_budget = data.monthlyBudget;
    if (data.defaultPaymentMethod !== undefined)
      upsertPayload.default_payment_method = data.defaultPaymentMethod;

    const { error } = await supabase.from("settings").upsert(upsertPayload);
    if (error) throw error;
    return 1;
  },

  async clear(): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("settings").delete().eq("user_id", user.id);
  },
};
