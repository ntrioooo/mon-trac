import { db } from "@/lib/db";
import type { Category } from "@/types/category";

export const categoryRepository = {
  async create(category: Category): Promise<string> {
    return db.categories.add(category);
  },

  async update(id: string, data: Partial<Category>): Promise<number> {
    return db.categories.update(id, data);
  },

  async delete(id: string): Promise<void> {
    await db.categories.delete(id);
  },

  async getById(id: string): Promise<Category | undefined> {
    return db.categories.get(id);
  },

  async getAll(): Promise<Category[]> {
    return db.categories.toArray();
  },

  async clear(): Promise<void> {
    await db.categories.clear();
  },
};
