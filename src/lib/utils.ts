import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes — avoids conflicting utilities.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer IDR amount to display string.
 * Uses Intl.NumberFormat("id-ID") for consistent Indonesian formatting.
 *
 * 25000 → "Rp 25.000"
 * 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string to Indonesian short format.
 * "2026-08-27" → "27 Agu 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format ISO date string to full Indonesian format.
 * "2026-08-27" → "Rabu, 27 Agustus 2026"
 */
export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getToday(): string {
  const now = new Date();
  return toLocalDateString(now);
}

/**
 * Convert Date to YYYY-MM-DD in local timezone.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the first and last day of a given month.
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/**
 * Get Indonesian month name and year.
 * "Agustus 2026"
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Determine relative day label for transaction grouping.
 */
export function getRelativeDayLabel(dateStr: string): string {
  const today = getToday();
  if (dateStr === today) return "Hari Ini";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === toLocalDateString(yesterday)) return "Kemarin";

  return formatDate(dateStr);
}

/**
 * Format number for input display (thousand separators).
 * 25000 → "25.000"
 */
export function formatAmountInput(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Parse input string to integer amount.
 * Strips non-numeric characters.
 * "25.000" → 25000
 * "25000" → 25000
 */
export function parseAmountInput(input: string): number {
  const cleaned = input.replace(/\D/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Generate a greeting based on time of day (Indonesian).
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
