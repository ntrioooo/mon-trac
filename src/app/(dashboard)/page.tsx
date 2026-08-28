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
import { getGreeting, formatMonthYear } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(prefix));

  const monthlySpending = calculateTotalSpending(monthTransactions);
  const todaySpending = calculateTodaySpending(transactions);
  const budgetRemaining = calculateBudgetRemaining(settings.monthlyBudget, monthlySpending);
  const budgetPercentage = calculateBudgetPercentage(settings.monthlyBudget, monthlySpending);
  const budgetStatus = getBudgetStatus(settings.monthlyBudget, monthlySpending);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);

  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Greeting */}
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {formatMonthYear(currentYear, currentMonth)}
        </p>
        <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-white">
          {getGreeting()}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
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
