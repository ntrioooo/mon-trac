"use client";

import { useState, useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { groupTransactionsByDate } from "@/lib/calculations/transaction-calculations";
import { formatCurrency, getRelativeDayLabel } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/types/transaction";
import { Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = transactions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return t.note?.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
      });
    }
    if (filterCategory) result = result.filter((t) => t.categoryId === filterCategory);
    return result;
  }, [transactions, search, filterCategory, categories]);

  const grouped = groupTransactionsByDate(filtered);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setDeleteId(null);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Header */}
      <h1 className="mb-4 text-xl font-extrabold tracking-tight text-white">
        Aktivitas
      </h1>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari transaksi..."
          className="w-full rounded-xl border border-white/8 bg-[#181820] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-white/20 focus:outline-none"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory("")}
          className={cn(
            "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
            !filterCategory
              ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
              : "border-white/8 text-slate-500"
          )}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              filterCategory === cat.id
                ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                : "border-white/8 text-slate-500"
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <p className="text-sm text-slate-500">
            {search || filterCategory ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {getRelativeDayLabel(group.date)}
                </span>
                <span className="text-xs font-semibold tabular-nums text-[#FF6B6B]">
                  -{formatCurrency(group.total)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#181820] divide-y divide-white/5">
                {group.transactions.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22222E] text-xl">
                        {cat?.icon ?? "📦"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                          {t.note || cat?.name || "Pengeluaran"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {cat?.name} · {PAYMENT_METHOD_LABELS[t.paymentMethod]}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold tabular-nums text-[#FF6B6B]">
                          -{formatCurrency(t.amount)}
                        </span>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-[#FF6B6B]/10 hover:text-[#FF6B6B]"
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

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="animate-fade-in relative mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#181820] p-6">
            <h3 className="mb-2 text-base font-bold text-white">Hapus transaksi?</h3>
            <p className="mb-5 text-sm text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-xl bg-[#FF6B6B] py-2.5 text-sm font-bold text-white"
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
