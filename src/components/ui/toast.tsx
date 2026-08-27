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
    <div className="toast-enter fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg",
          type === "success" ? "bg-[var(--color-emerald)]" : "bg-[var(--color-rose)]"
        )}
      >
        {type === "success" ? (
          <CheckCircle className="h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" />
        )}
        <span>{message}</span>
        <button onClick={onClose} className="ml-1 shrink-0" aria-label="Tutup">
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
