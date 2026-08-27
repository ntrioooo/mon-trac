import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import { getToday, toLocalDateString } from "@/lib/utils";

/**
 * Calculate total spending for a set of transactions.
 * Uses integer arithmetic only.
 */
export function calculateTotalSpending(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate today's spending from a transaction list.
 */
export function calculateTodaySpending(transactions: Transaction[]): number {
  const today = getToday();
  return transactions
    .filter((t) => t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate spending per category.
 * Returns sorted array (highest spending first).
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[]
): { category: Category; total: number; percentage: number }[] {
  const totalSpending = calculateTotalSpending(transactions);
  const categoryMap = new Map<string, number>();

  for (const t of transactions) {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + t.amount);
  }

  const result = Array.from(categoryMap.entries())
    .map(([categoryId, total]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        category: category ?? {
          id: categoryId,
          name: "Tidak diketahui",
          icon: "❓",
          color: "#6B7280",
          isDefault: false,
          createdAt: "",
        },
        total,
        percentage: totalSpending > 0 ? Math.round((total / totalSpending) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  return result;
}

/**
 * Calculate spending per day for a month.
 * Returns array of { date, total } for each day that has spending.
 */
export function calculateDailySpending(
  transactions: Transaction[]
): { date: string; total: number }[] {
  const dailyMap = new Map<string, number>();

  for (const t of transactions) {
    dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + t.amount);
  }

  return Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate average daily spending.
 */
export function calculateAverageDailySpending(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;

  const total = calculateTotalSpending(transactions);
  const uniqueDays = new Set(transactions.map((t) => t.date)).size;

  if (uniqueDays === 0) return 0;
  return Math.round(total / uniqueDays);
}

/**
 * Find the largest transaction.
 */
export function findLargestTransaction(
  transactions: Transaction[]
): Transaction | null {
  if (transactions.length === 0) return null;
  return transactions.reduce((max, t) => (t.amount > max.amount ? t : max));
}

/**
 * Find the category with the most spending.
 */
export function findLargestCategory(
  transactions: Transaction[],
  categories: Category[]
): { category: Category; total: number } | null {
  const spending = calculateCategorySpending(transactions, categories);
  return spending.length > 0 ? spending[0] : null;
}

/**
 * Calculate monthly spending for the past N months.
 * Returns array with { month, year, total, label }.
 */
export function calculateMonthlyComparison(
  transactions: Transaction[],
  months: number = 6
): { month: number; year: number; total: number; label: string }[] {
  const now = new Date();
  const result: { month: number; year: number; total: number; label: string }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;

    const monthTransactions = transactions.filter((t) => t.date.startsWith(prefix));
    const total = calculateTotalSpending(monthTransactions);

    const label = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d);
    result.push({ month, year, total, label });
  }

  return result;
}

/**
 * Group transactions by date for display.
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): { date: string; transactions: Transaction[]; total: number }[] {
  const groups = new Map<string, Transaction[]>();

  // Sort newest first
  const sorted = [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });

  for (const t of sorted) {
    const existing = groups.get(t.date);
    if (existing) {
      existing.push(t);
    } else {
      groups.set(t.date, [t]);
    }
  }

  return Array.from(groups.entries()).map(([date, txns]) => ({
    date,
    transactions: txns,
    total: txns.reduce((sum, t) => sum + t.amount, 0),
  }));
}
