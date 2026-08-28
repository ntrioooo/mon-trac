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
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

  const totalSpending = calculateTotalSpending(monthTransactions);
  const dailySpending = calculateDailySpending(monthTransactions);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);
  const avgDaily = calculateAverageDailySpending(monthTransactions);
  const largest = findLargestTransaction(monthTransactions);
  const largestCat = findLargestCategory(monthTransactions, categories);
  const monthlyComparison = calculateMonthlyComparison(transactions, 6);

  const dailyChartData = dailySpending.map((d) => ({
    day: parseInt(d.date.split("-")[2]),
    total: d.total,
  }));

  const navigateMonth = (offset: number) => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltipValue = (value: any) => formatCurrency(Number(value ?? 0));

  const tooltipStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    color: "#0F172A",
    fontSize: "12px",
    fontWeight: 700,
    padding: "8px 12px",
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* Month Selector */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Analytics</h1>
        <div className="flex items-center gap-1 rounded-2xl bg-white p-1 border border-slate-200/80 shadow-xs">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7.5rem] text-center text-xs font-bold text-[#0F172A]">
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="Total Bulan Ini" value={formatCurrency(totalSpending)} accent />
        <StatCard label="Rata-rata / Hari" value={formatCurrency(avgDaily)} />
        <StatCard label="Transaksi Terbesar" value={largest ? formatCurrency(largest.amount) : "-"} />
        <StatCard label="Kategori Terbesar" value={largestCat?.category.name ?? "-"} subValue={largestCat ? formatCurrency(largestCat.total) : undefined} />
      </div>

      {/* Daily Bar Chart */}
      {dailyChartData.length > 0 && (
        <div className="pastel-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pengeluaran Harian
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.6)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(day) => `Tanggal ${day}`}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(124,58,237,0.06)" }}
                />
                <Bar dataKey="total" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Donut */}
      {categorySpending.length > 0 && (
        <div className="pastel-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Porsi Kategori
          </p>
          <div className="flex items-center gap-5">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySpending.slice(0, 6)} dataKey="total" innerRadius={34} outerRadius={56} paddingAngle={3} strokeWidth={0}>
                    {categorySpending.slice(0, 6).map((entry, i) => (
                      <Cell key={i} fill={entry.category.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {categorySpending.slice(0, 6).map((item) => (
                <div key={item.category.id} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.category.color }} />
                  <span className="flex-1 truncate text-xs font-semibold text-slate-600">{item.category.name}</span>
                  <span className="shrink-0 text-xs font-extrabold tabular-nums text-[#0F172A]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Comparison */}
      {monthlyComparison.some((m) => m.total > 0) && (
        <div className="pastel-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Perbandingan 6 Bulan Terakhir
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} barCategoryGap="25%">
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={formatTooltipValue} contentStyle={tooltipStyle} cursor={{ fill: "rgba(74,222,128,0.1)" }} />
                <Bar dataKey="total" fill="#4ADE80" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthTransactions.length === 0 && (
        <div className="pastel-card mt-8 p-10 text-center">
          <div className="mb-2 text-3xl">📊</div>
          <p className="text-sm font-bold text-[#0F172A]">Belum ada data untuk bulan ini</p>
          <p className="mt-1 text-xs text-slate-400">Pilih bulan lain atau catat pengeluaran baru</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subValue, accent }: { label: string; value: string; subValue?: string; accent?: boolean }) {
  return (
    <div className={`pastel-card p-4.5 ${accent ? "border-violet-200/80 bg-violet-50/40" : ""}`}>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`text-base font-extrabold tabular-nums ${accent ? "text-violet-700" : "text-[#0F172A]"}`}>{value}</div>
      {subValue && <div className="mt-0.5 text-xs font-semibold tabular-nums text-slate-400">{subValue}</div>}
    </div>
  );
}
