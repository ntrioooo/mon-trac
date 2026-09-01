"use client";

import { useMemo, useState } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import {
  calculateTotalSpending,
  calculateTotalIncome,
  calculateNetCashFlow,
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
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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
  const totalIncome = calculateTotalIncome(monthTransactions);
  const netCashFlow = calculateNetCashFlow(monthTransactions);
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
    border: "1.5px solid rgba(168,200,232,0.5)",
    boxShadow: "0 8px 24px rgba(26,43,107,0.1)",
    color: "#1A2B6B",
    fontSize: "12px",
    fontWeight: 800,
    padding: "8px 12px",
  };

  const isPositive = netCashFlow >= 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#1A2B6B" }}>Analitik</h1>
          <p className="text-xs font-semibold text-[#9AA8C8] mt-0.5">
            Ringkasan keuangan bulanan
          </p>
        </div>
        <div
          className="flex items-center gap-1 rounded-[var(--radius)] p-1 border-2"
          style={{ backgroundColor: "white", borderColor: "rgba(168,200,232,0.5)" }}
        >
          <button
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#9AA8C8] hover:bg-[#E0F0FB] transition-colors"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7rem] text-center text-xs font-black" style={{ color: "#1A2B6B" }}>
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#9AA8C8] hover:bg-[#E0F0FB] transition-colors"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Net Cash Flow Hero ── */}
      <div
        className="rounded-[var(--radius)] p-4 mb-4 relative overflow-hidden hero-navy"
        style={{ boxShadow: "0 8px 24px rgba(26,43,107,0.35)" }}
      >
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#A8C8E8] opacity-15" />
        <div className="absolute right-10 -bottom-5 h-14 w-14 rounded-full bg-[#F4A0C0] opacity-15" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
            Arus Kas Bersih
          </p>
          <p className="text-2xl font-black tabular-nums text-white">
            {isPositive ? "+" : "-"}{formatCurrency(Math.abs(netCashFlow))}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="Pengeluaran" value={formatCurrency(totalSpending)} color="#C0456A" bg="#FDE8F2" />
        <StatCard label="Pemasukan" value={formatCurrency(totalIncome)} color="#3A6E28" bg="#E8F6E2" />
        <StatCard label="Rata-rata / Hari" value={formatCurrency(avgDaily)} color="#A07010" bg="#FFF5D6" />
        <StatCard label="Terbesar" value={largest ? formatCurrency(largest.amount) : "-"} color="#2A6BA8" bg="#E0F0FB" subValue={largestCat?.category.name} />
      </div>

      {/* ── Daily Bar Chart ── */}
      {dailyChartData.length > 0 && (
        <div className="fun-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-[#9AA8C8]">
            Pengeluaran Harian
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(168,200,232,0.4)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9AA8C8", fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(day) => `Tanggal ${day}`}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(26,43,107,0.05)" }}
                />
                <Bar dataKey="total" fill="#1A2B6B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Category Donut ── */}
      {categorySpending.length > 0 && (
        <div className="fun-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Porsi per Kategori
          </p>
          <div className="flex items-center gap-5">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending.slice(0, 6)}
                    dataKey="total"
                    innerRadius={34}
                    outerRadius={56}
                    paddingAngle={4}
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
                <div key={item.category.id} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <span className="flex-1 truncate text-xs font-semibold text-slate-600">
                    {item.category.name}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{
                      backgroundColor: item.category.color + "18",
                      color: item.category.color,
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Comparison ── */}
      {monthlyComparison.some((m) => m.total > 0) && (
        <div className="fun-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-[#9AA8C8]">
            6 Bulan Terakhir
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} barCategoryGap="25%">
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9AA8C8", fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={formatTooltipValue} contentStyle={tooltipStyle} cursor={{ fill: "rgba(168,200,232,0.1)" }} />
                <Bar dataKey="total" fill="#A8C8E8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthTransactions.length === 0 && (
        <div className="fun-card mt-8 p-10 text-center">
          <p className="text-sm font-black" style={{ color: "#1A2B6B" }}>Belum ada data bulan ini</p>
          <p className="mt-1 text-xs font-semibold text-[#9AA8C8]">
            Pilih bulan lain atau catat transaksi baru
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
  color,
  bg,
}: {
  label: string;
  value: string;
  subValue?: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-[var(--radius)] p-4 border-2"
      style={{ backgroundColor: bg, borderColor: color + "30" }}
    >
      <div
        className="mb-1.5 text-[10px] font-black uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </div>
      <div className="text-base font-black tabular-nums" style={{ color: "#1A2B6B" }}>
        {value}
      </div>
      {subValue && (
        <div className="mt-0.5 text-xs font-semibold text-[#9AA8C8] truncate">{subValue}</div>
      )}
    </div>
  );
}
