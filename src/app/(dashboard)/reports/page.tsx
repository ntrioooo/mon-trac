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
    backgroundColor: "#22222E",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 600,
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* Month Selector */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight text-white">Insights</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#22222E] text-slate-400 hover:bg-[#2A2A38]"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[8rem] text-center text-sm font-semibold text-white">
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#22222E] text-slate-400 hover:bg-[#2A2A38]"
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
        <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820] p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Pengeluaran Harian
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(day) => `Tanggal ${day}`}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Donut */}
      {categorySpending.length > 0 && (
        <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820] p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Per Kategori
          </p>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySpending.slice(0, 6)} dataKey="total" innerRadius={32} outerRadius={55} paddingAngle={2} strokeWidth={0}>
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
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.category.color }} />
                  <span className="flex-1 truncate text-xs text-slate-400">{item.category.name}</span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-white">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Comparison */}
      {monthlyComparison.some((m) => m.total > 0) && (
        <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820] p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Perbandingan 6 Bulan
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} barCategoryGap="30%">
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={formatTooltipValue} contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthTransactions.length === 0 && (
        <div className="mt-10 text-center">
          <div className="mb-2 text-3xl">📊</div>
          <p className="text-sm text-slate-500">Belum ada data untuk bulan ini</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subValue, accent }: { label: string; value: string; subValue?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-[#F59E0B]/20 bg-[#F59E0B]/8" : "border-white/8 bg-[#181820]"}`}>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-sm font-bold tabular-nums ${accent ? "text-[#F59E0B]" : "text-white"}`}>{value}</div>
      {subValue && <div className="mt-0.5 text-xs tabular-nums text-slate-500">{subValue}</div>}
    </div>
  );
}
