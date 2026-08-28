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
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl",
          type === "success"
            ? "border-[#10B981]/20 bg-[#22222E] text-[#10B981]"
            : "border-[#FF6B6B]/20 bg-[#22222E] text-[#FF6B6B]"
        )}
      >
        {type === "success" ? (
          <CheckCircle className="h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" />
        )}
        <span className="text-white">{message}</span>
        <button onClick={onClose} className="ml-1 shrink-0 text-slate-500 hover:text-slate-300" aria-label="Tutup">
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
