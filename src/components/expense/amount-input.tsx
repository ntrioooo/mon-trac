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

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseAmountInput(e.target.value));
  };

  return (
    <div className="text-center">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Jumlah
      </div>
      <div className="inline-flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-500">Rp</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value > 0 ? formatAmountInput(value) : ""}
          onChange={handleChange}
          placeholder="0"
          className="w-48 border-none bg-transparent text-center text-5xl font-extrabold tabular-nums tracking-tight text-white placeholder:text-white/20 focus:outline-none"
          autoComplete="off"
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#FF6B6B]">{error}</p>}
    </div>
  );
}
