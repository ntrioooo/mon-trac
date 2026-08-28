"use client";

import { useState, useEffect, useRef } from "react";
import { X, Target } from "lucide-react";
import { formatAmountInput, parseAmountInput, cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import { useSession } from "next-auth/react";
import { syncEngine } from "@/lib/sync-engine";

interface BudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BudgetSheet({ open, onOpenChange, onSuccess }: BudgetSheetProps) {
  const settings = useSettingsStore((s) => s.settings);
  const setMonthlyBudget = useSettingsStore((s) => s.setMonthlyBudget);
  const { data: session } = useSession();

  const [rawAmount, setRawAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRawAmount(settings.monthlyBudget || 0);
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [open, settings.monthlyBudget]);

  if (!open) return null;

  const formatted = rawAmount > 0 ? formatAmountInput(rawAmount) : "";

  // Dynamic font size calculation
  const fontSizeClass =
    formatted.length > 13
      ? "text-2xl"
      : formatted.length > 10
      ? "text-3xl"
      : formatted.length > 7
      ? "text-4xl"
      : "text-5xl";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const budgetValue = rawAmount > 0 ? rawAmount : undefined;
      await setMonthlyBudget(budgetValue);

      // Background Sync to Supabase
      const userIdentifier = session?.user?.email || session?.user?.id;
      if (userIdentifier && navigator.onLine) {
        syncEngine.syncSettings(
          { ...settings, monthlyBudget: budgetValue },
          userIdentifier
        );
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save budget:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBudget = (val: number) => {
    setRawAmount(val);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      {/* Bottom Sheet Modal */}
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t border-slate-100 bg-white p-6 shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center -mt-2 pb-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Atur Anggaran Bulanan
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Batas maksimal pengeluaran setiap bulan
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Amount Input */}
          <div className="text-center py-2">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Target Anggaran
            </div>
            <div className="flex w-full items-baseline justify-center gap-1.5 px-2">
              <span className="text-2xl font-bold text-slate-400 shrink-0">Rp</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={formatted}
                onChange={(e) => setRawAmount(parseAmountInput(e.target.value))}
                placeholder="0"
                className={cn(
                  "w-full max-w-[280px] border-none bg-transparent text-center font-extrabold tabular-nums tracking-tight text-[#0F172A] placeholder:text-slate-200 focus:outline-none transition-all",
                  fontSizeClass
                )}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pilihan Cepat
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1500000, 3000000, 5000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickBudget(val)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer",
                    rawAmount === val
                      ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {formatAmountInput(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-extrabold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
