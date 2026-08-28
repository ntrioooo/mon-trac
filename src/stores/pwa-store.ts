"use client";

import { create } from "zustand";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  showIOSModal: boolean;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setIsStandalone: (standalone: boolean) => void;
  setIsIOS: (isIOS: boolean) => void;
  setShowIOSModal: (show: boolean) => void;
  promptInstall: () => Promise<boolean>;
}

export const usePwaStore = create<PwaState>((set, get) => ({
  deferredPrompt: null,
  isInstallable: false,
  isStandalone: false,
  isIOS: false,
  showIOSModal: false,

  setDeferredPrompt: (prompt) =>
    set({ deferredPrompt: prompt, isInstallable: !!prompt }),

  setIsStandalone: (isStandalone) => set({ isStandalone }),
  setIsIOS: (isIOS) => set({ isIOS }),
  setShowIOSModal: (showIOSModal) => set({ showIOSModal }),

  promptInstall: async () => {
    const { deferredPrompt, isIOS, isStandalone } = get();

    if (isStandalone) {
      return true;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          set({ deferredPrompt: null, isInstallable: false });
          return true;
        }
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      }
      return false;
    }

    if (isIOS) {
      set({ showIOSModal: true });
      return false;
    }

    // Default fallback if browser hasn't fired beforeinstallprompt yet
    set({ showIOSModal: true });
    return false;
  },
}));
