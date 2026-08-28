import { create } from "zustand";
import type { Settings } from "@/types/settings";
import type { PaymentMethod } from "@/types/transaction";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { syncEngine } from "@/lib/sync-engine";

interface SettingsState {
  settings: Settings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>, userIdentifier?: string | null) => Promise<void>;
  setMonthlyBudget: (budget: number | undefined, userIdentifier?: string | null) => Promise<void>;
  setDefaultPaymentMethod: (method: PaymentMethod, userIdentifier?: string | null) => Promise<void>;
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

  updateSettings: async (data: Partial<Settings>, userIdentifier?: string | null) => {
    await settingsRepository.update(data);
    const updated = await settingsRepository.get();
    set({ settings: updated });
    if (navigator.onLine) {
      syncEngine.syncSettings(updated, userIdentifier);
    }
  },

  setMonthlyBudget: async (budget: number | undefined, userIdentifier?: string | null) => {
    await settingsRepository.update({ monthlyBudget: budget });
    const updated = await settingsRepository.get();
    set({ settings: updated });
    if (navigator.onLine) {
      syncEngine.syncSettings(updated, userIdentifier);
    }
  },

  setDefaultPaymentMethod: async (method: PaymentMethod, userIdentifier?: string | null) => {
    await settingsRepository.update({ defaultPaymentMethod: method });
    const updated = await settingsRepository.get();
    set({ settings: updated });
    if (navigator.onLine) {
      syncEngine.syncSettings(updated, userIdentifier);
    }
  },
}));

