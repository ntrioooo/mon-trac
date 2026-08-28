"use client";

import { useEffect, useCallback, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 2800 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 flex justify-center pointer-events-none">
      <div
        className={cn(
          "animate-slide-down pointer-events-auto flex w-full max-w-sm sm:max-w-md items-center justify-between gap-3 rounded-2xl border bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl transition-all",
          type === "success"
            ? "border-emerald-100 shadow-emerald-500/10 text-emerald-950"
            : "border-rose-100 shadow-rose-500/10 text-rose-950"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {type === "success" ? (
              <CheckCircle2 className="h-4.5 w-4.5" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-bold leading-snug truncate text-[#0F172A]">
            {message}
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
