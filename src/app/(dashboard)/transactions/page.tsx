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

const EXPENSE_COLORS = [
  { bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  { bg: "rgba(123,97,255,0.12)", color: "#7B61FF" },
  { bg: "rgba(255,217,61,0.18)", color: "#B8860B" },
  { bg: "rgba(76,201,240,0.14)", color: "#0284C7" },
  { bg: "rgba(249,115,22,0.14)", color: "#EA6500" },
  { bg: "rgba(236,72,153,0.12)", color: "#C2185B" },
];

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

    if (filterType !== "all") {
      result = result.filter((t) =>
        filterType === "expense" ? (t.type === "expense" || !t.type) : t.type === filterType
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return t.note?.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
      });
    }

    if (filterCategory) {
      result = result.filter((t) => t.categoryId === filterCategory);
    }

    if (filterWallet) {
      result = result.filter((t) => t.walletId === filterWallet || t.toWalletId === filterWallet);
    }

    return result;
  }, [transactions, search, filterCategory, filterType, filterWallet, categories]);

  const grouped = groupTransactionsByDate(filtered);
  const hasActiveFilter = filterCategory || filterWallet || search || filterType !== "all";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#1A2B6B" }}>Aktivitas 📋</h1>
          <p className="text-xs font-semibold text-[#9AA8C8] mt-0.5">
            {filtered.length} transaksi
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 rounded-[var(--radius-pill)] border-2 px-3.5 py-2 text-xs font-black transition-all",
            hasActiveFilter
              ? "border-[#1A2B6B] bg-[#E0F0FB] text-[#1A2B6B]"
              : "border-[rgba(168,200,232,0.5)] bg-white text-[#9AA8C8] hover:border-[#1A2B6B] hover:text-[#1A2B6B]"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {hasActiveFilter ? "Filter Aktif" : "Filter"}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA8C8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan atau kategori..."
          className="w-full rounded-[var(--radius-pill)] border-2 border-[rgba(168,200,232,0.5)] bg-white py-2.5 pl-11 pr-4 text-sm font-semibold placeholder:text-[#9AA8C8] focus:border-[#1A2B6B] focus:outline-none transition-all"
          style={{ color: "#1A2B6B" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA8C8] hover:text-[#1A2B6B]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Type Filter Tabs ── */}
      <div className="flex gap-2 mb-3">
        {([
          { key: "all", label: "Semua" },
          { key: "expense", label: "Keluar" },
          { key: "income", label: "Masuk" },
        ] as { key: TypeFilter; label: string }[]).map(({ key, label }) => {
          const active = filterType === key;
          return (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={cn(
                "flex-1 rounded-[var(--radius-pill)] border-2 py-2 text-xs font-black transition-all",
                active && key === "all" && "text-white",
                active && key === "expense" && "text-white",
                active && key === "income" && "text-white",
                !active && "bg-white text-[#9AA8C8] hover:border-[#9AA8C8]"
              )}
              style={active ? {
                backgroundColor: key === "all" ? "#1A2B6B" : key === "expense" ? "#E07A9E" : "#8EBD78",
                borderColor: key === "all" ? "#1A2B6B" : key === "expense" ? "#E07A9E" : "#8EBD78",
              } : { borderColor: "rgba(168,200,232,0.5)" }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Expanded Filters ── */}
      {showFilters && (
        <div className="mb-3 fun-card p-4 space-y-3">
          {/* Category Filter */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kategori
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilterCategory("")}
                className={cn(
                  "shrink-0 rounded-[var(--radius-pill)] border-2 px-3 py-1.5 text-xs font-bold transition-all",
                  !filterCategory
                    ? "border-[#1A1A2E] bg-[#1A1A2E] text-white"
                    : "border-[rgba(255,220,195,0.6)] bg-white text-slate-500"
                )}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 rounded-[var(--radius-pill)] border-2 px-3 py-1.5 text-xs font-bold transition-all",
                    filterCategory === cat.id
                      ? "border-[#FF6B6B] bg-[#FFF0F0] text-[#FF6B6B]"
                      : "border-[rgba(255,220,195,0.6)] bg-white text-slate-500"
                  )}
                >
                  <CategoryIcon icon={cat.icon} color="#FF6B6B" className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Filter */}
          {wallets.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dompet
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterWallet("")}
                  className={cn(
                    "shrink-0 rounded-[var(--radius-pill)] border-2 px-3 py-1.5 text-xs font-bold transition-all",
                    !filterWallet
                      ? "border-[#1A1A2E] bg-[#1A1A2E] text-white"
                      : "border-[rgba(255,220,195,0.6)] bg-white text-slate-500"
                  )}
                >
                  Semua
                </button>
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setFilterWallet(w.id)}
                    className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-pill)] border-2 px-3 py-1.5 text-xs font-bold transition-all"
                    style={
                      filterWallet === w.id
                        ? { borderColor: w.color, backgroundColor: w.color + "15", color: w.color }
                        : { borderColor: "rgba(255,220,195,0.6)", backgroundColor: "white", color: "#64748B" }
                    }
                  >
                    <CategoryIcon icon={w.icon} color={filterWallet === w.id ? w.color : "#94A3B8"} className="h-3.5 w-3.5" />
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
              className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B] hover:text-[#E85555] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Hapus semua filter
            </button>
          )}
        </div>
      )}

      {/* ── Transaction List ── */}
      {grouped.length === 0 ? (
        <div className="fun-card mt-8 p-10 text-center">
          <div className="mb-3 text-4xl">{hasActiveFilter ? "🔍" : "🌱"}</div>
          <p className="text-sm font-bold text-[#1A1A2E]">
            {hasActiveFilter ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            {hasActiveFilter
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Catat transaksi pertama dengan tombol + di bawah"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date Group Header */}
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {getRelativeDayLabel(group.date)}
                </span>
                <div className="flex items-center gap-2">
                  {group.incomeTotal > 0 && (
                    <span className="rounded-[var(--radius-pill)] bg-[rgba(78,205,196,0.15)] px-2 py-0.5 text-xs font-black tabular-nums" style={{ color: "#38B2A8" }}>
                      +{formatCurrency(group.incomeTotal)}
                    </span>
                  )}
                  {group.expenseTotal > 0 && (
                    <span className="rounded-[var(--radius-pill)] bg-[rgba(255,107,107,0.12)] px-2 py-0.5 text-xs font-black tabular-nums text-[#FF6B6B]">
                      -{formatCurrency(group.expenseTotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Cards */}
              <div className="fun-card overflow-hidden">
                {group.transactions.map((t, idx) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const wallet = wallets.find((w) => w.id === t.walletId);
                  const isIncome = t.type === "income";
                  const iconBg = isIncome
                    ? "rgba(78,205,196,0.15)"
                    : EXPENSE_COLORS[idx % EXPENSE_COLORS.length].bg;
                  const iconColor = isIncome
                    ? "#38B2A8"
                    : EXPENSE_COLORS[idx % EXPENSE_COLORS.length].color;
                  const amountColor = isIncome ? "#38B2A8" : "#FF6B6B";
                  const amountPrefix = isIncome ? "+" : "-";

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => dispatchEditTransaction(t)}
                      className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#FFF8F3] transition-colors text-left border-b border-[rgba(255,220,195,0.3)] last:border-b-0"
                    >
                      {/* Icon */}
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: iconBg }}
                      >
                        <CategoryIcon icon={cat?.icon ?? "Package"} color={iconColor} className="h-5 w-5" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#1A1A2E]">
                          {t.note || cat?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cat && (
                            <span
                              className="inline-block rounded-[var(--radius-pill)] px-2 py-0.5 text-[9px] font-bold"
                              style={{ backgroundColor: iconBg, color: iconColor }}
                            >
                              {cat.name}
                            </span>
                          )}
                          {wallet && (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-slate-400">
                              <CategoryIcon icon={wallet.icon} color={wallet.color} className="h-2.5 w-2.5" />
                              {wallet.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <span
                        className="text-sm font-black tabular-nums shrink-0"
                        style={{ color: amountColor }}
                      >
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
