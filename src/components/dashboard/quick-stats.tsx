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
      <div className="rounded-2xl border border-white/8 bg-[#181820] p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-[#10B981]">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Hari Ini
          </span>
        </div>
        <div className="text-lg font-bold tabular-nums tracking-tight text-white">
          {formatCurrency(todaySpending)}
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#181820] p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-[#06B6D4]">
            <Receipt className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Transaksi
          </span>
        </div>
        <div className="text-lg font-bold tabular-nums tracking-tight text-white">
          {transactionCount}
        </div>
      </div>
    </div>
  );
}
