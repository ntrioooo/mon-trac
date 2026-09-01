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

  const fontSizeClass =
    formatted.length > 13 ? "text-2xl"
    : formatted.length > 10 ? "text-3xl"
    : formatted.length > 7  ? "text-4xl"
    : "text-5xl";

  const isIncome = type === "income";

  // Unified: violet for expense, emerald for income — but both clean/minimal
  const label = isIncome ? "NOMINAL PEMASUKAN" : "NOMINAL PENGELUARAN";
  const labelColor = isIncome ? "#10B981" : "#7C3AED";
  const amountColor = value === 0 ? "#CBD5E1" : isIncome ? "#10B981" : "#7C3AED";

  return (
    <div className="w-full rounded-2xl bg-violet-50 py-5 px-4 text-center"
      style={isIncome ? { backgroundColor: "#F0FDF4" } : { backgroundColor: "#F5F3FF" }}
    >
      <p
        className="mb-2 text-[10px] font-bold tracking-widest"
        style={{ color: labelColor }}
      >
        {label}
      </p>
      <div className="flex w-full items-baseline justify-center gap-1.5">
        <span
          className="text-xl font-bold shrink-0"
          style={{ color: amountColor }}
        >
          Rp
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder="0"
          className={cn(
            "w-full max-w-[260px] border-none bg-transparent text-center font-bold tabular-nums tracking-tight focus:outline-none",
            fontSizeClass
          )}
          style={{ color: amountColor }}
          autoComplete="off"
        />
      </div>
      {value === 0 && (
        <p className="mt-1.5 text-[10px] text-slate-400">
          Ketuk angka untuk mengisi nominal
        </p>
      )}
      {error && <p className="mt-1 text-xs font-bold text-rose-500">{error}</p>}
    </div>
  );
}
