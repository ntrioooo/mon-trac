"use client";

import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction?: (transaction: Transaction) => void;
}

export function RecentTransactions({ transactions, categories, onEditTransaction }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="pastel-card p-8 text-center">
        <div className="mb-3 text-3xl">📝</div>
        <p className="text-sm font-bold text-[#0F172A]">Belum ada transaksi</p>
        <p className="mt-1 text-xs font-medium text-slate-400">
          Tap tombol + di bawah untuk mencatat transaksi pertama
        </p>
      </div>
    );
  }

  return (
    <div className="pastel-card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Transaksi Terbaru
        </p>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-xs font-bold text-violet-600 hover:text-violet-700"
        >
          Lihat semua
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.map((t) => {
          const category = categories.find((c) => c.id === t.categoryId);
          const isIncome = t.type === "income";
          const iconBg = isIncome ? "bg-emerald-50" : "bg-violet-50";
          const iconColor = isIncome ? "#10B981" : "#7C3AED";
          const amountColor = isIncome ? "text-emerald-600" : "text-rose-500";
          const amountPrefix = isIncome ? "+" : "-";

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onEditTransaction?.(t)}
              className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/60 transition-colors text-left"
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", iconBg)}>
                <CategoryIcon
                  icon={category?.icon ?? "Package"}
                  color={iconColor}
                  className="h-5 w-5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[#0F172A]">
                  {t.note || category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {category?.name} · {t.date}
                </div>
              </div>
              <div className={cn("text-sm font-extrabold tabular-nums shrink-0", amountColor)}>
                {amountPrefix}{formatCurrency(t.amount)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
