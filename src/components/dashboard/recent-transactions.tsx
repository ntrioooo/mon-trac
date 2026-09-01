"use client";

import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";

// Row pastel backgrounds — icon always violet, matches ingatmiskin reference
const ROW_BG = [
  "#FDE8F4",  // pink
  "#FEF9C3",  // yellow
  "#EFF6FF",  // sky blue
  "#EDE9FE",  // violet/lavender
  "#F0FDF4",  // mint
];

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction?: (transaction: Transaction) => void;
}

export function RecentTransactions({
  transactions,
  categories,
  onEditTransaction,
}: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="pastel-card p-8 text-center">
        <div className="mb-3 text-3xl">🌱</div>
        <p className="text-sm font-bold text-slate-700">Belum ada transaksi</p>
        <p className="mt-1 text-xs text-slate-400">
          Tap <span className="font-bold text-violet-600">+</span> di bawah untuk mulai mencatat
        </p>
      </div>
    );
  }

  return (
    <div className="pastel-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-violet-400" strokeWidth={2.5} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Terbaru</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors"
        >
          Lihat semua <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Rows */}
      <div className="px-4 py-3 space-y-2">
        {transactions.map((t, idx) => {
          const category = categories.find((c) => c.id === t.categoryId);
          const isIncome = t.type === "income";
          const rowBg = isIncome ? "#F0FDF4" : ROW_BG[idx % ROW_BG.length];

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onEditTransaction?.(t)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.99]"
              style={{ backgroundColor: rowBg }}
            >
              {/* Icon — violet bg always */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                <CategoryIcon
                  icon={category?.icon ?? "Package"}
                  color="#7C3AED"
                  className="h-5 w-5"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-800">
                  {t.note || category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {category && (
                    <span className="text-[10px] text-slate-500">{category.name}</span>
                  )}
                  <span className="text-[10px] text-slate-400">· {t.date}</span>
                </div>
              </div>

              <div className={`text-sm font-bold tabular-nums shrink-0 ${
                isIncome ? "text-emerald-600" : "text-rose-500"
              }`}>
                {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
