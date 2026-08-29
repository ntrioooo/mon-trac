"use client";

import { useRef, useEffect } from "react";
import { formatAmountInput, parseAmountInput, cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  type?: TransactionType;
}

export function AmountInput({ value, onChange, error, type = "expense" }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseAmountInput(e.target.value));
  };

  const formatted = value > 0 ? formatAmountInput(value) : "";

  // Dynamic text size scaling so large amounts are never truncated
  const fontSizeClass =
    formatted.length > 13
      ? "text-2xl"
      : formatted.length > 10
      ? "text-3xl"
      : formatted.length > 7
      ? "text-4xl"
      : "text-5xl";

  const amountColor = type === "income" ? "text-emerald-600" : "text-[#0F172A]";
  const label = type === "income" ? "Nominal Pemasukan" : "Nominal Pengeluaran";

  return (
    <div className="w-full text-center py-2">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="flex w-full items-baseline justify-center gap-1.5 px-2">
        <span className={cn("text-xl sm:text-2xl font-bold shrink-0", amountColor)}>Rp</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder="0"
          className={cn(
            "w-full max-w-[280px] border-none bg-transparent text-center font-extrabold tabular-nums tracking-tight placeholder:text-slate-200 focus:outline-none transition-all",
            fontSizeClass,
            amountColor
          )}
          autoComplete="off"
        />
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
