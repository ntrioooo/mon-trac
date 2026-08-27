"use client";

import { formatCurrency } from "@/lib/utils";
import { Wallet, Receipt } from "lucide-react";

interface QuickStatsProps {
  todaySpending: number;
  transactionCount: number;
}

export function QuickStats({ todaySpending, transactionCount }: QuickStatsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[var(--color-emerald)]">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-xs text-[var(--color-slate)]">Hari ini</span>
        </div>
        <div className="text-lg font-bold tabular-nums text-[var(--color-ink)]">
          {formatCurrency(todaySpending)}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Receipt className="h-4 w-4" />
          </div>
          <span className="text-xs text-[var(--color-slate)]">Transaksi</span>
        </div>
        <div className="text-lg font-bold tabular-nums text-[var(--color-ink)]">
          {transactionCount}
        </div>
      </div>
    </div>
  );
}
