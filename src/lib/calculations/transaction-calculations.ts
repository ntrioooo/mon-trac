import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import { getToday } from "@/lib/utils";

/**
 * Calculate total EXPENSE spending for a set of transactions.
 */
export function calculateTotalSpending(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense" || !t.type) // backward compat: old records without type
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total INCOME for a set of transactions.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total EXPENSE for a set of transactions.
 */
export function calculateTotalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense" || !t.type)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate net cash flow: income - expense.
 */
export function calculateNetCashFlow(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
}

/**
 * Calculate today's EXPENSE spending from a transaction list.
 */
export function calculateTodaySpending(transactions: Transaction[]): number {
  const today = getToday();
  return transactions
    .filter((t) => t.date === today && (t.type === "expense" || !t.type))
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate today's INCOME from a transaction list.
 */
export function calculateTodayIncome(transactions: Transaction[]): number {
  const today = getToday();
  return transactions
    .filter((t) => t.date === today && t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate spending per category (expense only).
 * Returns sorted array (highest spending first).
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[]
): { category: Category; total: number; percentage: number }[] {
  const expenseTransactions = transactions.filter((t) => t.type === "expense" || !t.type);
  const totalSpending = calculateTotalExpense(expenseTransactions);
  const categoryMap = new Map<string, number>();

  for (const t of expenseTransactions) {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + t.amount);
  }

  const result = Array.from(categoryMap.entries())
    .map(([categoryId, total]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        category: category ?? {
          id: categoryId,
          name: "Tidak diketahui",
          type: "expense" as const,
          icon: "Package",
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
 * Calculate spending per day for a month (expense only).
 */
export function calculateDailySpending(
  transactions: Transaction[]
): { date: string; total: number }[] {
  const dailyMap = new Map<string, number>();

  for (const t of transactions.filter((t) => t.type === "expense" || !t.type)) {
    dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + t.amount);
  }

  return Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate average daily spending (expense only).
 */
export function calculateAverageDailySpending(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === "expense" || !t.type);
  if (expenses.length === 0) return 0;

  const total = calculateTotalExpense(expenses);
  const uniqueDays = new Set(expenses.map((t) => t.date)).size;

  if (uniqueDays === 0) return 0;
  return Math.round(total / uniqueDays);
}

/**
 * Find the largest expense transaction.
 */
export function findLargestTransaction(
  transactions: Transaction[]
): Transaction | null {
  const expenses = transactions.filter((t) => t.type === "expense" || !t.type);
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max));
}

/**
 * Find the category with the most spending (expense only).
 */
export function findLargestCategory(
  transactions: Transaction[],
  categories: Category[]
): { category: Category; total: number } | null {
  const spending = calculateCategorySpending(transactions, categories);
  return spending.length > 0 ? spending[0] : null;
}

/**
 * Calculate monthly spending comparison for the past N months (expense only).
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
    const total = calculateTotalExpense(monthTransactions);

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
): { date: string; transactions: Transaction[]; total: number; incomeTotal: number; expenseTotal: number }[] {
  const groups = new Map<string, Transaction[]>();

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
    incomeTotal: txns.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    expenseTotal: txns.filter((t) => t.type === "expense" || !t.type).reduce((sum, t) => sum + t.amount, 0),
  }));
}
