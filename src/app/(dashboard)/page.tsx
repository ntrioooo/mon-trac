"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card";
import { BudgetSheet } from "@/components/dashboard/budget-sheet";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Toast, useToast } from "@/components/ui/toast";
import {
  calculateTotalSpending,
  calculateTodaySpending,
  calculateCategorySpending,
} from "@/lib/calculations/transaction-calculations";
import {
  calculateBudgetRemaining,
  calculateBudgetPercentage,
  getBudgetStatus,
} from "@/lib/calculations/budget-calculations";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);

  const [budgetOpen, setBudgetOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) =>
    t.date.startsWith(prefix),
  );

  const monthlySpending = calculateTotalSpending(monthTransactions);
  const todaySpending = calculateTodaySpending(transactions);
  const budgetRemaining = calculateBudgetRemaining(
    settings.monthlyBudget,
    monthlySpending,
  );
  const budgetPercentage = calculateBudgetPercentage(
    settings.monthlyBudget,
    monthlySpending,
  );
  const budgetStatus = getBudgetStatus(settings.monthlyBudget, monthlySpending);
  const categorySpending = calculateCategorySpending(
    monthTransactions,
    categories,
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(now);

  return (
    <div className="min-h-dvh pb-8">
      {/* Aurora Lavender Header */}
      <div className="bg-aurora-header px-4 pt-6 pb-6 border-b border-violet-100/50">
        <div className="mx-auto max-w-lg">
          {/* Top Date Badge */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 shadow-xs backdrop-blur text-xs font-semibold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-violet-600" />
              <span>{todayFormatted}</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-600">
              {getGreeting()}
              {firstName ? `, ${firstName}` : ""} 👋
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mx-auto max-w-lg px-4 -mt-3 space-y-4">
        {/* Monthly Summary Hero Card */}
        <MonthlySummaryCard
          spending={monthlySpending}
          budget={settings.monthlyBudget}
          remaining={budgetRemaining}
          percentage={budgetPercentage}
          status={budgetStatus}
          onEditBudget={() => setBudgetOpen(true)}
        />

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
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
