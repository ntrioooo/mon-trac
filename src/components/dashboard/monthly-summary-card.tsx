"use client";

import { formatCurrency } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/calculations/budget-calculations";
import { cn } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

interface MonthlySummaryCardProps {
  spending: number;
  budget?: number;
  remaining: number | null;
  percentage: number | null;
  status: BudgetStatus;
}

export function MonthlySummaryCard({
  spending,
  budget,
  remaining,
  percentage,
  status,
}: MonthlySummaryCardProps) {
  const clampedPercentage = percentage !== null ? Math.min(percentage, 100) : 0;

  const statusColor =
    status === "exceeded"
      ? "text-[#FF6B6B]"
      : status === "warning"
      ? "text-[#F59E0B]"
      : "text-[#10B981]";

  const barColor =
    status === "exceeded"
      ? "bg-[#FF6B6B]"
      : status === "warning"
      ? "bg-[#F59E0B]"
      : "bg-[#10B981]";

  return (
    <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820] p-5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Pengeluaran Bulan Ini
      </p>
      <div className="mb-4 flex items-end gap-3">
        <span className="text-4xl font-extrabold tabular-nums tracking-tight text-white">
          {formatCurrency(spending)}
        </span>
        {budget && budget > 0 && percentage !== null && (
          <span
            className={cn(
              "mb-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
              status === "exceeded"
                ? "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                : status === "warning"
                ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                : "bg-[#10B981]/15 text-[#10B981]"
            )}
          >
            <TrendingDown className="h-3 w-3" />
            {percentage}%
          </span>
        )}
      </div>

      {budget !== undefined && budget > 0 && (
        <>
          {/* Progress bar */}
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("budget-bar h-full rounded-full", barColor)}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Anggaran {formatCurrency(budget)}
            </span>
            <span className={cn("font-semibold", statusColor)}>
              {remaining !== null && remaining >= 0
                ? `Sisa ${formatCurrency(remaining)}`
                : remaining !== null
                ? `Lebih ${formatCurrency(Math.abs(remaining))}`
                : ""}
            </span>
          </div>
        </>
      )}

      {(budget === undefined || budget === 0) && (
        <p className="text-xs text-slate-600">
          Atur anggaran bulanan di Pengaturan
        </p>
      )}
    </div>
  );
}
