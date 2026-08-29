"use client";

import { useState, useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useWalletStore } from "@/stores/wallet-store";
import { groupTransactionsByDate } from "@/lib/calculations/transaction-calculations";
import { formatCurrency, getRelativeDayLabel } from "@/lib/utils";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types/transaction";

function dispatchEditTransaction(transaction: Transaction) {
  window.dispatchEvent(new CustomEvent("montrac:edit-transaction", { detail: transaction }));
}

type TypeFilter = "all" | "expense" | "income";

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterType, setFilterType] = useState<TypeFilter>("all");
  const [filterWallet, setFilterWallet] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = transactions;

    // Type filter
    if (filterType !== "all") {
      result = result.filter((t) =>
        filterType === "expense" ? (t.type === "expense" || !t.type) : t.type === filterType
      );
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return t.note?.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
      });
    }

    // Category filter
    if (filterCategory) {
      result = result.filter((t) => t.categoryId === filterCategory);
    }

    // Wallet filter
    if (filterWallet) {
      result = result.filter((t) => t.walletId === filterWallet || t.toWalletId === filterWallet);
    }

    return result;
  }, [transactions, search, filterCategory, filterType, filterWallet, categories]);

  const grouped = groupTransactionsByDate(filtered);

  const hasActiveFilter = filterCategory || filterWallet || search || filterType !== "all";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
          Aktivitas
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
            hasActiveFilter
              ? "border-violet-600 bg-violet-50 text-violet-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {hasActiveFilter ? "Filter Aktif" : "Filter"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan atau kategori..."
          className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-slate-400 shadow-xs focus:border-violet-500 focus:outline-none"
        />
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 mb-3">
        {(["all", "expense", "income"] as TypeFilter[]).map((t) => {
          const label = t === "all" ? "Semua" : t === "expense" ? "Pengeluaran" : "Pemasukan";
          const active = filterType === t;
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "flex-1 rounded-xl border py-2 text-xs font-bold transition-colors",
                active && t === "all" && "border-violet-600 bg-violet-50 text-violet-700 shadow-xs",
                active && t === "expense" && "border-rose-500 bg-rose-50 text-rose-700 shadow-xs",
                active && t === "income" && "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs",
                !active && "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          {/* Category Filter */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kategori
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
          </div>

          {/* Wallet Filter */}
          {wallets.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dompet
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterWallet("")}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
                    !filterWallet
                      ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Semua
                </button>
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setFilterWallet(w.id)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
                      filterWallet === w.id
                        ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <CategoryIcon icon={w.icon} color={w.color} className="h-3.5 w-3.5" />
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilter && (
            <button
              onClick={() => {
                setFilterCategory("");
                setFilterWallet("");
                setSearch("");
                setFilterType("all");
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Hapus semua filter
            </button>
          )}
        </div>
      )}

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div className="pastel-card mt-8 p-10 text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <p className="text-sm font-bold text-[#0F172A]">
            {hasActiveFilter ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {hasActiveFilter
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Catat transaksi pertama Anda dengan menekan tombol +"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {getRelativeDayLabel(group.date)}
                </span>
                <div className="flex items-center gap-2">
                  {group.incomeTotal > 0 && (
                    <span className="text-xs font-extrabold tabular-nums text-emerald-600">
                      +{formatCurrency(group.incomeTotal)}
                    </span>
                  )}
                  {group.expenseTotal > 0 && (
                    <span className="text-xs font-extrabold tabular-nums text-rose-500">
                      -{formatCurrency(group.expenseTotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Cards */}
              <div className="pastel-card overflow-hidden divide-y divide-slate-100">
                {group.transactions.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const wallet = wallets.find((w) => w.id === t.walletId);
                  const isIncome = t.type === "income";
                  const iconBg = isIncome ? "bg-emerald-50" : "bg-violet-50";
                  const iconColor = isIncome ? "#10B981" : "#7C3AED";
                  const amountColor = isIncome ? "text-emerald-600" : "text-rose-500";
                  const amountPrefix = isIncome ? "+" : "-";

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => dispatchEditTransaction(t)}
                      className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/60 transition-colors text-left"
                    >
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", iconBg)}>
                        <CategoryIcon icon={cat?.icon ?? "Package"} color={iconColor} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#0F172A]">
                          {t.note || cat?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <span>{cat?.name}</span>
                          {wallet && (
                            <>
                              <span>·</span>
                              <CategoryIcon icon={wallet.icon} color={wallet.color} className="h-3 w-3" />
                              <span>{wallet.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={cn("text-sm font-extrabold tabular-nums shrink-0", amountColor)}>
                        {amountPrefix}{formatCurrency(t.amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
