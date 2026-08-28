"use client";

import { useState, useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { groupTransactionsByDate } from "@/lib/calculations/transaction-calculations";
import { formatCurrency, getRelativeDayLabel } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/types/transaction";
import { Search, Trash2, X } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
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
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* Header */}
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-[#0F172A]">
        Aktivitas Transaksi
      </h1>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengeluaran atau catatan..."
          className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-slate-400 shadow-xs focus:border-violet-500 focus:outline-none"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory("")}
          className={cn(
            "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
            !filterCategory
              ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
              filterCategory === cat.id
                ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <CategoryIcon icon={cat.icon} color="#7C3AED" className="h-3.5 w-3.5" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div className="pastel-card mt-8 p-10 text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <p className="text-sm font-bold text-[#0F172A]">
            {search || filterCategory ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {search || filterCategory ? "Coba ubah filter atau kata kunci pencarian" : "Catat pengeluaran pertama Anda dengan menekan tombol +"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {getRelativeDayLabel(group.date)}
                </span>
                <span className="text-xs font-extrabold tabular-nums text-rose-500">
                  -{formatCurrency(group.total)}
                </span>
              </div>
              <div className="pastel-card overflow-hidden divide-y divide-slate-100">
                {group.transactions.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  return (
                    <div key={t.id} className="flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <CategoryIcon
                          icon={cat?.icon ?? "Package"}
                          color="#7C3AED"
                          className="h-5 w-5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#0F172A]">
                          {t.note || cat?.name || "Pengeluaran"}
                        </div>
                        <div className="text-xs font-medium text-slate-400">
                          {cat?.name} · {PAYMENT_METHOD_LABELS[t.paymentMethod]}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold tabular-nums text-rose-500">
                          -{formatCurrency(t.amount)}
                        </span>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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

      {/* Delete Confirmation Bottom Sheet */}
      {deleteId && (
        <div className="fixed inset-0 z-50">
          <div
            className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setDeleteId(null)}
          />
          <div
            className="animate-slide-up absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}
          >
            {/* Handle bar */}
            <div className="flex justify-center -mt-2 pb-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-[#0F172A]">Hapus transaksi?</h3>
              <button
                onClick={() => setDeleteId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-6 text-sm font-medium text-slate-500">
              Transaksi ini akan dihapus secara permanen dari riwayat pengeluaran Anda.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-extrabold text-white shadow-md shadow-rose-500/25 hover:bg-rose-600 active:scale-[0.98] transition-all cursor-pointer"
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
