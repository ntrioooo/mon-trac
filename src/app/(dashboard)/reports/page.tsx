"use client";

import { useMemo, useState } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import {
  calculateTotalSpending,
  calculateDailySpending,
  calculateCategorySpending,
  calculateAverageDailySpending,
  calculateMonthlyComparison,
  findLargestTransaction,
  findLargestCategory,
} from "@/lib/calculations/transaction-calculations";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReportsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix));

  // Stats
  const totalSpending = calculateTotalSpending(monthTransactions);
  const dailySpending = calculateDailySpending(monthTransactions);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);
  const avgDaily = calculateAverageDailySpending(monthTransactions);
  const largest = findLargestTransaction(monthTransactions);
  const largestCat = findLargestCategory(monthTransactions, categories);
  const monthlyComparison = calculateMonthlyComparison(transactions, 6);

  // Format daily data for chart
  const dailyChartData = dailySpending.map((d) => ({
    day: parseInt(d.date.split("-")[2]),
    total: d.total,
  }));

  const navigateMonth = (offset: number) => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltipValue = (value: any) => formatCurrency(Number(value ?? 0));

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      {/* Month Selector */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-ink)]">Laporan</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-5 w-5 text-[var(--color-slate)]" />
          </button>
          <span className="min-w-[8rem] text-center text-sm font-medium text-[var(--color-ink)]">
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-5 w-5 text-[var(--color-slate)]" />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="Total" value={formatCurrency(totalSpending)} />
        <StatCard label="Rata-rata / hari" value={formatCurrency(avgDaily)} />
        <StatCard
          label="Transaksi terbesar"
          value={largest ? formatCurrency(largest.amount) : "-"}
        />
        <StatCard
          label="Kategori terbesar"
          value={largestCat?.category.name ?? "-"}
          subValue={largestCat ? formatCurrency(largestCat.total) : undefined}
        />
      </div>

      {/* Daily Spending Chart */}
      {dailyChartData.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            Pengeluaran Harian
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(day) => `Tanggal ${day}`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Spending */}
      {categorySpending.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            Per Kategori
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending.slice(0, 6)}
                    dataKey="total"
                    innerRadius={32}
                    outerRadius={55}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {categorySpending.slice(0, 6).map((entry, i) => (
                      <Cell key={i} fill={entry.category.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categorySpending.slice(0, 6).map((item) => (
                <div key={item.category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span className="truncate text-xs text-[var(--color-slate)]">
                      {item.category.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium tabular-nums text-[var(--color-ink)]">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Comparison */}
      {monthlyComparison.some((m) => m.total > 0) && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            Perbandingan 6 Bulan
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={formatTooltipValue}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthTransactions.length === 0 && (
        <div className="mt-8 text-center">
          <div className="mb-2 text-3xl">📊</div>
          <p className="text-sm text-[var(--color-muted)]">
            Belum ada data untuk bulan ini
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 text-xs text-[var(--color-muted)]">{label}</div>
      <div className="text-sm font-bold tabular-nums text-[var(--color-ink)]">{value}</div>
      {subValue && (
        <div className="mt-0.5 text-xs tabular-nums text-[var(--color-slate)]">{subValue}</div>
      )}
    </div>
  );
}
