"use client";

import { formatCurrency } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/calculations/budget-calculations";
import { cn } from "@/lib/utils";

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

  return (
    <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-1 text-sm text-[var(--color-slate)]">
        Pengeluaran bulan ini
      </div>
      <div className="mb-4 text-3xl font-bold tabular-nums text-[var(--color-ink)]">
        {formatCurrency(spending)}
      </div>

      {budget !== undefined && budget > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[var(--color-slate)]">
              Anggaran {formatCurrency(budget)}
            </span>
            <span
              className={cn(
                "font-medium",
                status === "exceeded"
                  ? "text-[var(--color-rose)]"
                  : status === "warning"
                  ? "text-[var(--color-amber)]"
                  : "text-[var(--color-emerald)]"
              )}
            >
              {percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "budget-bar h-full rounded-full",
                status === "exceeded"
                  ? "bg-[var(--color-rose)]"
                  : status === "warning"
                  ? "bg-[var(--color-amber)]"
                  : "bg-[var(--color-emerald)]"
              )}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>

          <div className="text-sm">
            {remaining !== null && remaining >= 0 ? (
              <span className="text-[var(--color-slate)]">
                Sisa {formatCurrency(remaining)}
              </span>
            ) : remaining !== null ? (
              <span className="text-[var(--color-rose)] font-medium">
                Melebihi anggaran {formatCurrency(Math.abs(remaining))}
              </span>
            ) : null}
          </div>
        </>
      )}

      {(budget === undefined || budget === 0) && (
        <p className="text-sm text-[var(--color-muted)]">
          Atur anggaran bulanan di Pengaturan
        </p>
      )}
    </div>
  );
}
