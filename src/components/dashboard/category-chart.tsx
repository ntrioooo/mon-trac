"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Category } from "@/types/category";

interface CategoryChartProps {
  data: { category: Category; total: number; percentage: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const top5 = data.slice(0, 5);

  return (
    <div className="pastel-card p-5">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Pengeluaran Per Kategori
      </p>
      <div className="flex items-center gap-5">
        {/* Donut Chart */}
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top5}
                dataKey="total"
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={3}
                strokeWidth={0}
              >
                {top5.map((entry, i) => (
                  <Cell key={i} fill={entry.category.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {top5.map((item) => (
            <div key={item.category.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="truncate text-xs font-semibold text-slate-600">
                  {item.category.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-[#0F172A]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
