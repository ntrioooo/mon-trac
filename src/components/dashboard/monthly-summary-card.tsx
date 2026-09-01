"use client";

import { formatCurrency, cn } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/calculations/budget-calculations";
import { SlidersHorizontal, TrendingUp, TrendingDown } from "lucide-react";

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

function getMoodEmoji(netCashFlow: number, spending: number, budget?: number): string {
  if (netCashFlow > 0) return "😄";
  if (netCashFlow === 0) return "😐";
  if (budget && spending > budget) return "😱";
  return "😅";
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
  const moodEmoji = getMoodEmoji(netCashFlow, spending, budget);

  // Lavender palette budget bar colors
  const barColor =
    status === "exceeded"
      ? "bg-rose-500"
      : status === "warning"
      ? "bg-amber-400"
      : "bg-emerald-500";

  const barLabelColor =
    status === "exceeded" ? "#EF4444" : status === "warning" ? "#D97706" : "#10B981";

  return (
    <div className="space-y-3">
      {/* ── Hero — deep violet gradient ── */}
      <div
        className="rounded-[var(--radius)] p-5 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)",
          boxShadow: "0 8px 28px rgba(30,27,75,0.35)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-violet-400 opacity-15" />
        <div className="absolute right-8 -bottom-8 h-20 w-20 rounded-full bg-purple-300 opacity-10" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 mb-1">
              Arus Kas Bulan Ini
            </p>
            <p className="text-3xl font-extrabold tabular-nums tracking-tight">
              {isPositiveFlow ? "+" : "-"}{formatCurrency(Math.abs(netCashFlow))}
            </p>
            <div className="mt-1.5">
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                style={{
                  backgroundColor: isPositiveFlow
                    ? "rgba(110,231,183,0.25)"
                    : "rgba(248,113,113,0.25)",
                }}
              >
                {isPositiveFlow ? "Keuangan sehat 👍" : "Jaga pengeluaran ya"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-4xl leading-none" role="img">{moodEmoji}</span>
            {onEditBudget && (
              <button
                onClick={onEditBudget}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                aria-label="Atur anggaran"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Income / Expense Split ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income — violet icon */}
        <div className="pastel-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
              <TrendingUp className="h-4 w-4 text-violet-500" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pemasukan
            </span>
          </div>
          <p className="text-base font-bold tabular-nums tracking-tight text-emerald-600">
            {formatCurrency(income)}
          </p>
        </div>

        {/* Expense — violet icon */}
        <div className="pastel-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
              <TrendingDown className="h-4 w-4 text-violet-500" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pengeluaran
            </span>
          </div>
          <p className="text-base font-bold tabular-nums tracking-tight text-rose-500">
            {formatCurrency(spending)}
          </p>
        </div>
      </div>

      {/* ── Budget Progress ── */}
      {budget !== undefined && budget > 0 ? (
        <div
          onClick={onEditBudget}
          className="pastel-card px-4 py-3.5 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Anggaran {formatCurrency(budget)}
            </span>
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor:
                  status === "exceeded" ? "#FEF2F2"
                  : status === "warning" ? "#FFFBEB"
                  : "#ECFDF5",
                color: barLabelColor,
              }}
            >
              {percentage}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("budget-bar h-full rounded-full", barColor)}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs font-bold" style={{ color: barLabelColor }}>
            {remaining !== null && remaining >= 0
              ? `Sisa ${formatCurrency(remaining)}`
              : remaining !== null
              ? `Lebih ${formatCurrency(Math.abs(remaining))}`
              : ""}
          </p>
        </div>
      ) : (
        <button
          onClick={onEditBudget}
          className="flex w-full items-center justify-between rounded-[var(--radius)] border-2 border-dashed border-violet-200 px-4 py-3 text-sm font-bold text-slate-400 hover:border-violet-400 hover:text-violet-600 transition-all"
        >
          <span>Atur target anggaran bulanan</span>
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
