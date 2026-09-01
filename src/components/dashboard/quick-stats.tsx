"use client";

import { formatCurrency } from "@/lib/utils";
import { Sun, ClipboardList } from "lucide-react";

interface QuickStatsProps {
  todaySpending: number;
  transactionCount: number;
}

export function QuickStats({ todaySpending, transactionCount }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Today */}
      <div className="pastel-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
            <Sun className="h-4 w-4 text-violet-500" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hari Ini
          </span>
        </div>
        <div className="text-lg font-bold tabular-nums tracking-tight text-slate-800">
          {formatCurrency(todaySpending)}
        </div>
        <div className="mt-0.5 text-[10px] font-semibold text-slate-400">pengeluaran</div>
      </div>

      {/* Transactions */}
      <div className="pastel-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
            <ClipboardList className="h-4 w-4 text-violet-500" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Transaksi
          </span>
        </div>
        <div className="text-lg font-bold tabular-nums tracking-tight text-slate-800">
          {transactionCount}
        </div>
        <div className="mt-0.5 text-[10px] font-semibold text-violet-500">bulan ini</div>
      </div>
    </div>
  );
}
