"use client";

import { useState, useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import {
  groupTransactionsByDate,
} from "@/lib/calculations/transaction-calculations";
import { formatCurrency, getRelativeDayLabel } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/types/transaction";
import { Search, Trash2, Edit3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter transactions
  const filtered = useMemo(() => {
    let result = transactions;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return (
          t.note?.toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q)
        );
      });
    }

    if (filterCategory) {
      result = result.filter((t) => t.categoryId === filterCategory);
    }

    return result;
  }, [transactions, search, filterCategory, categories]);

  const grouped = groupTransactionsByDate(filtered);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setDeleteId(null);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold text-[var(--color-ink)]">
        Transaksi
      </h1>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari transaksi..."
          className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-emerald)]"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory("")}
          className={cn(
            "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            !filterCategory
              ? "border-[var(--color-emerald)] bg-emerald-50 text-[var(--color-emerald-deep)]"
              : "border-[var(--color-border)] text-[var(--color-slate)]"
          )}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filterCategory === cat.id
                ? "border-[var(--color-emerald)] bg-emerald-50 text-[var(--color-emerald-deep)]"
                : "border-[var(--color-border)] text-[var(--color-slate)]"
            )}
          >
            <CategoryIcon icon={cat.icon} color={cat.color} className="h-3.5 w-3.5" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <p className="text-sm text-[var(--color-muted)]">
            {search || filterCategory
              ? "Transaksi tidak ditemukan"
              : "Belum ada transaksi"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase text-[var(--color-muted)]">
                  {getRelativeDayLabel(group.date)}
                </span>
                <span className="text-xs font-medium tabular-nums text-[var(--color-slate)]">
                  -{formatCurrency(group.total)}
                </span>
              </div>
              <div className="rounded-2xl bg-white shadow-sm divide-y divide-[var(--color-border)]">
                {group.transactions.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                        <CategoryIcon
                          icon={cat?.icon ?? "Package"}
                          color={cat?.color}
                          className="h-5 w-5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--color-ink)]">
                          {t.note || cat?.name || "Pengeluaran"}
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">
                          {cat?.name} • {PAYMENT_METHOD_LABELS[t.paymentMethod]}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                          -{formatCurrency(t.amount)}
                        </span>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-red-50 hover:text-[var(--color-rose)]"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="animate-fade-in relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">
              Hapus transaksi?
            </h3>
            <p className="mb-5 text-sm text-[var(--color-slate)]">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-slate)]"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-xl bg-[var(--color-rose)] py-2.5 text-sm font-medium text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
