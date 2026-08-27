"use client";

import { formatCurrency, getRelativeDayLabel } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
        <div className="mb-2 text-3xl">📝</div>
        <p className="text-sm font-medium text-[var(--color-ink)]">
          Belum ada pengeluaran
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Tap tombol + untuk mencatat pengeluaran pertamamu
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">
          Transaksi Terbaru
        </h3>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-emerald)]"
        >
          Lihat semua
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {transactions.map((t) => {
          const category = categories.find((c) => c.id === t.categoryId);
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 px-5 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl">
                {category?.icon ?? "📦"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--color-ink)]">
                  {t.note || category?.name || "Pengeluaran"}
                </div>
                <div className="text-xs text-[var(--color-muted)]">
                  {category?.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                  -{formatCurrency(t.amount)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
