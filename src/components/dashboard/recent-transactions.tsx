"use client";

import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-[#181820] p-8 text-center">
        <div className="mb-3 text-3xl">📝</div>
        <p className="text-sm font-semibold text-white">Belum ada pengeluaran</p>
        <p className="mt-1 text-xs text-slate-500">
          Tap tombol + untuk mencatat pengeluaran pertamamu
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[#181820]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Transaksi Terbaru
        </p>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-xs font-semibold text-[#F59E0B]"
        >
          Lihat semua
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-white/5">
        {transactions.map((t) => {
          const category = categories.find((c) => c.id === t.categoryId);
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22222E]"
                style={category?.color ? { backgroundColor: `${category.color}18` } : undefined}
              >
                <CategoryIcon
                  icon={category?.icon ?? "Package"}
                  color={category?.color}
                  className="h-5 w-5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  {t.note || category?.name || "Pengeluaran"}
                </div>
                <div className="text-xs text-slate-500">
                  {category?.name}
                </div>
              </div>
              <div className="text-sm font-bold tabular-nums text-[#FF6B6B]">
                -{formatCurrency(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
