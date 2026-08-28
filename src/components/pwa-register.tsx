"use client";

import { useEffect } from "react";
import { usePwaStore } from "@/stores/pwa-store";

export function PwaRegister() {
  const setDeferredPrompt = usePwaStore((s) => s.setDeferredPrompt);
  const setIsStandalone = usePwaStore((s) => s.setIsStandalone);
  const setIsIOS = usePwaStore((s) => s.setIsIOS);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check Standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandalone);

    // Check iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !(window as any).MSStream;
    setIsIOS(isIOS);

    // Listen for Chrome / Android / Edge PWA Install Prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Service Worker Registration
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [setDeferredPrompt, setIsStandalone, setIsIOS]);

  return null;
}
