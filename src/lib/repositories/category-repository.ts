import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/category";
import { DEFAULT_CATEGORIES } from "@/types/category";

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error.message);
      return [];
    }

    // Auto-seed default categories for new user
    if (!data || data.length === 0) {
      const now = new Date().toISOString();
      const initial = DEFAULT_CATEGORIES.map((cat) => ({
        id: `${cat.id}-${user.id.slice(0, 8)}`,
        user_id: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_default: cat.isDefault,
        created_at: now,
      }));

      const { error: seedError } = await supabase.from("categories").insert(initial);
      if (seedError) {
        console.error("Error seeding default categories:", seedError.message);
        return [];
      }

      return initial.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: cat.is_default,
        createdAt: cat.created_at,
      }));
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      isDefault: row.is_default,
      createdAt: row.created_at,
    }));
  },

  async getById(id: string): Promise<Category | undefined> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      isDefault: data.is_default,
      createdAt: data.created_at,
    };
  },

  async create(category: Category): Promise<string> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("categories").insert({
      id: category.id,
      user_id: user.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      is_default: category.isDefault,
      created_at: category.createdAt || new Date().toISOString(),
    });

    if (error) throw error;
    return category.id;
  },

  async update(id: string, data: Partial<Category>): Promise<number> {
    const supabase = createClient();
    const updatePayload: Record<string, unknown> = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.isDefault !== undefined) updatePayload.is_default = data.isDefault;

    const { error } = await supabase
      .from("categories")
      .update(updatePayload)
      .eq("id", id);

    if (error) throw error;
    return 1;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  async clear(): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("categories").delete().eq("user_id", user.id);
  },
};
