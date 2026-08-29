"use client";

import { formatCurrency, cn } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/calculations/budget-calculations";
import { TrendingDown, TrendingUp, SlidersHorizontal, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MonthlySummaryCardProps {
  spending: number;
  income: number;
  netCashFlow: number;
  budget?: number;
  remaining: number | null;
  percentage: number | null;
  status: BudgetStatus;
  onEditBudget?: () => void;
}

export function MonthlySummaryCard({
  spending,
  income,
  netCashFlow,
  budget,
  remaining,
  percentage,
  status,
  onEditBudget,
}: MonthlySummaryCardProps) {
  const clampedPercentage = percentage !== null ? Math.min(percentage, 100) : 0;
  const isPositiveFlow = netCashFlow >= 0;

  const barColor =
    status === "exceeded"
      ? "bg-rose-500"
      : status === "warning"
      ? "bg-amber-500"
      : "bg-violet-600";

  return (
    <div className="pastel-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Bulan Ini
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
          {onEditBudget && (
            <button
              onClick={onEditBudget}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Atur Anggaran"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Income / Expense Split Row */}
      <div className="flex gap-3 mb-4">
        {/* Income */}
        <div className="flex-1 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Pemasukan
            </span>
          </div>
          <p className="text-base font-extrabold tabular-nums tracking-tight text-emerald-700">
            {formatCurrency(income)}
          </p>
        </div>

        {/* Expense */}
        <div className="flex-1 rounded-2xl bg-rose-50/70 border border-rose-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100">
              <ArrowDownRight className="h-3 w-3 text-rose-600" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Pengeluaran
            </span>
          </div>
          <p className="text-base font-extrabold tabular-nums tracking-tight text-rose-600">
            {formatCurrency(spending)}
          </p>
        </div>
      </div>

      {/* Net Cash Flow */}
      <div className="mb-4">
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Arus Kas Bersih
        </p>
        <span
          className={cn(
            "text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight",
            isPositiveFlow ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {isPositiveFlow ? "+" : "-"}
          {formatCurrency(Math.abs(netCashFlow))}
        </span>
      </div>

      {/* Budget Progress */}
      {budget !== undefined && budget > 0 ? (
        <div
          onClick={onEditBudget}
          className="group cursor-pointer rounded-xl transition-all"
        >
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
            <span
              className={cn(
                "font-bold",
                status === "exceeded" ? "text-rose-600" : status === "warning" ? "text-amber-600" : "text-emerald-600"
              )}
            >
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
