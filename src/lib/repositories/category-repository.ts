import { db, initializeDatabase } from "@/lib/db";
import type { Category } from "@/types/category";

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    await initializeDatabase();
    return await db.categories.toArray();
  },

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  },

  async create(category: Category): Promise<string> {
    const now = new Date().toISOString();
    const item: Category = {
      ...category,
      createdAt: category.createdAt || now,
    };
    await db.categories.put(item);
    return item.id;
  },

  async update(id: string, data: Partial<Category>): Promise<number> {
    const existing = await db.categories.get(id);
    if (!existing) return 0;

    await db.categories.update(id, data);
    return 1;
  },

  async delete(id: string): Promise<void> {
    await db.categories.delete(id);
  },

  async clear(): Promise<void> {
    await db.categories.clear();
  },
};
