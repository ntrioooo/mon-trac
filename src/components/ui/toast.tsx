"use client";

import { useEffect, useCallback, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast-enter fixed top-5 left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-xl shadow-slate-200/60",
          type === "success"
            ? "border-emerald-200 text-emerald-700"
            : "border-rose-200 text-rose-700"
        )}
      >
        {type === "success" ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
        <span className="text-slate-800 font-semibold">{message}</span>
        <button onClick={onClose} className="ml-1.5 shrink-0 text-slate-400 hover:text-slate-600" aria-label="Tutup">
          <X className="h-4 w-4" />
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
