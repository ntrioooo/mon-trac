import { create } from "zustand";
import type { Category } from "@/types/category";
import { categoryRepository } from "@/lib/repositories/category-repository";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;

  loadCategories: () => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await categoryRepository.getAll();
      set({ categories, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addCategory: async (category: Category) => {
    await categoryRepository.create(category);
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    await categoryRepository.update(id, data);
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }));
  },

  deleteCategory: async (id: string) => {
    await categoryRepository.delete(id);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));
