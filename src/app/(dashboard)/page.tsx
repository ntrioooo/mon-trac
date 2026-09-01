"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card";
import { BudgetSheet } from "@/components/dashboard/budget-sheet";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletCarousel } from "@/components/dashboard/wallet-carousel";
import { Toast, useToast } from "@/components/ui/toast";
import {
  calculateTotalExpense,
  calculateTotalIncome,
  calculateNetCashFlow,
  calculateTodaySpending,
  calculateCategorySpending,
} from "@/lib/calculations/transaction-calculations";
import {
  calculateBudgetRemaining,
  calculateBudgetPercentage,
  getBudgetStatus,
} from "@/lib/calculations/budget-calculations";
import { cn } from "@/lib/utils";
import { syncEngine } from "@/lib/sync-engine";
import type { Transaction } from "@/types/transaction";

function getGreetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 5) return "🌙";
  if (h < 12) return "☀️";
  if (h < 17) return "🌤️";
  if (h < 21) return "🌅";
  return "🌙";
}

function getGreetingText(): string {
  const h = new Date().getHours();
  if (h < 5) return "Malam";
  if (h < 12) return "Pagi";
  if (h < 17) return "Siang";
  if (h < 21) return "Sore";
  return "Malam";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [budgetOpen, setBudgetOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  // editTransaction kept for future use via global event
  const [, setEditTransaction] = useState<Transaction | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const userIdentifier = session?.user?.email || session?.user?.id;
    try {
      const res = await syncEngine.syncAll(userIdentifier);
      await Promise.all([loadTransactions(), loadSettings()]);
      if (res.success) {
        showToast("Data tersinkronkan ✓", "success");
      } else {
        showToast(`Gagal sinkron: ${res.error || "Cek koneksi"}`, "error");
      }
    } catch {
      showToast("Gagal menyinkronkan data", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(prefix));

  const monthlySpending = calculateTotalExpense(monthTransactions);
  const monthlyIncome = calculateTotalIncome(monthTransactions);
  const netCashFlow = calculateNetCashFlow(monthTransactions);
  const todaySpending = calculateTodaySpending(transactions);
  const budgetRemaining = calculateBudgetRemaining(settings.monthlyBudget, monthlySpending);
  const budgetPercentage = calculateBudgetPercentage(settings.monthlyBudget, monthlySpending);
  const budgetStatus = getBudgetStatus(settings.monthlyBudget, monthlySpending);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);

  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(now);

  return (
    <div className="min-h-dvh pb-8">
      {/* ── Playful Header ── */}
      <div className="bg-playful-header px-4 pt-6 pb-8">
        <div className="mx-auto max-w-lg">
          {/* Top row: greeting + sync */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs font-black text-[#9AA8C8] uppercase tracking-wider">
                {monthName} {currentYear}
              </p>
              <h1 className="text-xl font-black" style={{ color: "#1A2B6B" }}>
                {getGreetingEmoji()} Halo{firstName ? `, ${firstName}` : ""}!
              </h1>
              <p className="text-xs font-semibold text-[#5A6A9A] mt-0.5">
                Selamat {getGreetingText()}, semangat mengelola jajan! 💪
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-black transition-all border-2 cursor-pointer disabled:opacity-60",
                isSyncing
                  ? "border-[#A8C8E8] bg-[#E0F0FB] text-[#2A6BA8]"
                  : "border-[rgba(168,200,232,0.5)] bg-white text-[#9AA8C8] hover:border-[#1A2B6B] hover:text-[#1A2B6B]"
              )}
              aria-label="Segarkan data"
              id="btn-refresh-dashboard"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")}
              />
              <span>{isSyncing ? "Sinkron..." : "Segarkan"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="mx-auto max-w-lg px-4 -mt-4 space-y-4">
        {/* Monthly Summary Hero Card */}
        <MonthlySummaryCard
          spending={monthlySpending}
          income={monthlyIncome}
          netCashFlow={netCashFlow}
          budget={settings.monthlyBudget}
          remaining={budgetRemaining}
          percentage={budgetPercentage}
          status={budgetStatus}
          onEditBudget={() => setBudgetOpen(true)}
        />

        {/* Wallet Carousel */}
        <WalletCarousel />

        {/* Quick Stats */}
        <QuickStats
          todaySpending={todaySpending}
          transactionCount={monthTransactions.length}
        />

        {/* Category Chart */}
        {categorySpending.length > 0 && (
          <CategoryChart data={categorySpending} />
        )}

        {/* Recent Transactions */}
        <RecentTransactions
          transactions={recentTransactions}
          categories={categories}
          onEditTransaction={setEditTransaction}
        />
      </div>

      {/* Budget Bottom Sheet */}
      <BudgetSheet
        open={budgetOpen}
        onOpenChange={setBudgetOpen}
        onSuccess={() => {
          showToast("Anggaran bulanan berhasil disimpan ✓", "success");
        }}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
