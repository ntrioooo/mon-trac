"use client";

import { useSession } from "next-auth/react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
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
import { getGreeting, formatMonthYear, getToday } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Filter current month transactions
  const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(prefix));

  // Calculations
  const monthlySpending = calculateTotalSpending(monthTransactions);
  const todaySpending = calculateTodaySpending(transactions);
  const budgetRemaining = calculateBudgetRemaining(settings.monthlyBudget, monthlySpending);
  const budgetPercentage = calculateBudgetPercentage(settings.monthlyBudget, monthlySpending);
  const budgetStatus = getBudgetStatus(settings.monthlyBudget, monthlySpending);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-[var(--color-ink)]">
          {getGreeting()} {firstName ? `${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-[var(--color-slate)]">
          {formatMonthYear(currentYear, currentMonth)}
        </p>
      </div>

      {/* Monthly Summary */}
      <MonthlySummaryCard
        spending={monthlySpending}
        budget={settings.monthlyBudget}
        remaining={budgetRemaining}
        percentage={budgetPercentage}
        status={budgetStatus}
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
  );
}
