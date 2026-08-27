/**
 * Calculate remaining budget.
 * Returns negative value when budget is exceeded.
 */
export function calculateBudgetRemaining(
  budget: number | undefined,
  spending: number
): number | null {
  if (budget === undefined || budget === 0) return null;
  return budget - spending;
}

/**
 * Calculate budget usage percentage.
 * Returns null if no budget is set.
 * Can exceed 100% when over budget.
 */
export function calculateBudgetPercentage(
  budget: number | undefined,
  spending: number
): number | null {
  if (budget === undefined || budget === 0) return null;
  return Math.round((spending / budget) * 100);
}

/**
 * Determine budget status for UI display.
 */
export type BudgetStatus = "safe" | "warning" | "exceeded" | "none";

export function getBudgetStatus(
  budget: number | undefined,
  spending: number
): BudgetStatus {
  if (budget === undefined || budget === 0) return "none";
  const percentage = (spending / budget) * 100;
  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "warning";
  return "safe";
}
