"use client";

import { formatCurrency } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/calculations/budget-calculations";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, SlidersHorizontal, Plus } from "lucide-react";

interface MonthlySummaryCardProps {
  spending: number;
  budget?: number;
  remaining: number | null;
  percentage: number | null;
  status: BudgetStatus;
  onEditBudget?: () => void;
}

export function MonthlySummaryCard({
  spending,
  budget,
  remaining,
  percentage,
  status,
  onEditBudget,
}: MonthlySummaryCardProps) {
  const clampedPercentage = percentage !== null ? Math.min(percentage, 100) : 0;

  const statusColor =
    status === "exceeded"
      ? "text-rose-600"
      : status === "warning"
      ? "text-amber-600"
      : "text-emerald-600";

  const barColor =
    status === "exceeded"
      ? "bg-rose-500"
      : status === "warning"
      ? "bg-amber-500"
      : "bg-violet-600";

  return (
    <div className="pastel-card p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Total Pengeluaran
        </p>
        <div className="flex items-center gap-1.5">
          {budget && budget > 0 && percentage !== null && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                status === "exceeded"
                  ? "bg-rose-50 text-rose-600"
                  : status === "warning"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              )}
            >
              {status === "exceeded" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {percentage}%
            </span>
          )}

          {/* Quick Edit Budget Button */}
          {onEditBudget && (
            <button
              onClick={onEditBudget}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Atur Anggaran"
              title="Atur Anggaran"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight text-[#0F172A]">
          {formatCurrency(spending)}
        </span>
      </div>

      {budget !== undefined && budget > 0 ? (
        <div
          onClick={onEditBudget}
          className="group cursor-pointer rounded-xl transition-all"
        >
          {/* Progress bar */}
          <div className="mb-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("budget-bar h-full rounded-full", barColor)}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium group-hover:text-violet-600 transition-colors">
              Anggaran {formatCurrency(budget)}
            </span>
            <span className={cn("font-bold", statusColor)}>
              {remaining !== null && remaining >= 0
                ? `Sisa ${formatCurrency(remaining)}`
                : remaining !== null
                ? `Lebih ${formatCurrency(Math.abs(remaining))}`
                : ""}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={onEditBudget}
          className="flex w-full items-center justify-between rounded-xl bg-violet-50/70 border border-violet-100 px-3.5 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-100/70 transition-all cursor-pointer"
        >
          <span>Atur target anggaran bulanan</span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-violet-600">
            <Plus className="h-3.5 w-3.5" />
            <span>Atur</span>
          </div>
        </button>
      )}
    </div>
  );
}
