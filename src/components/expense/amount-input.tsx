"use client";

import { useRef, useEffect } from "react";
import { formatAmountInput, parseAmountInput } from "@/lib/utils";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function AmountInput({ value, onChange, error }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300); // Delay to allow sheet animation
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseAmountInput(raw);
    onChange(parsed);
  };

  const displayValue = value > 0 ? formatAmountInput(value) : "";

  return (
    <div className="text-center">
      <div className="mb-1 text-sm font-medium text-[var(--color-slate)]">
        Jumlah
      </div>
      <div className="relative inline-flex items-baseline gap-1">
        <span className="text-lg font-medium text-[var(--color-muted)]">Rp</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className="w-48 border-none bg-transparent text-center text-4xl font-bold tabular-nums text-[var(--color-ink)] placeholder:text-gray-300 focus:outline-none"
          autoComplete="off"
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-[var(--color-rose)]">{error}</p>
      )}
    </div>
  );
}
