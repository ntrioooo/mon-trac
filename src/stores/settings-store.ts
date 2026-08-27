import { create } from "zustand";
import type { Settings } from "@/types/settings";
import type { PaymentMethod } from "@/types/transaction";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { DEFAULT_SETTINGS } from "@/types/settings";

interface SettingsState {
  settings: Settings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
  setMonthlyBudget: (budget: number | undefined) => Promise<void>;
  setDefaultPaymentMethod: (method: PaymentMethod) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await settingsRepository.get();
      set({ settings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data: Partial<Settings>) => {
    await settingsRepository.update(data);
    set((state) => ({
      settings: { ...state.settings, ...data },
    }));
  },

  setMonthlyBudget: async (budget: number | undefined) => {
    await settingsRepository.update({ monthlyBudget: budget });
    set((state) => ({
      settings: { ...state.settings, monthlyBudget: budget },
    }));
  },

  setDefaultPaymentMethod: async (method: PaymentMethod) => {
    await settingsRepository.update({ defaultPaymentMethod: method });
    set((state) => ({
      settings: { ...state.settings, defaultPaymentMethod: method },
    }));
  },
}));
