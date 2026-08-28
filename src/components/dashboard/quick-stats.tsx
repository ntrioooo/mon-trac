"use client";

import { formatCurrency } from "@/lib/utils";
import { Wallet, Receipt } from "lucide-react";

interface QuickStatsProps {
  todaySpending: number;
  transactionCount: number;
}

export function QuickStats({ todaySpending, transactionCount }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Hari Ini */}
      <div className="pastel-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hari Ini
          </span>
        </div>
        <div className="text-lg font-extrabold tabular-nums tracking-tight text-[#0F172A]">
          {formatCurrency(todaySpending)}
        </div>
      </div>

      {/* Transaksi */}
      <div className="pastel-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Receipt className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Transaksi
          </span>
        </div>
        <div className="text-lg font-extrabold tabular-nums tracking-tight text-[#0F172A]">
          {transactionCount}
        </div>
      </div>
    </div>
  );
}
