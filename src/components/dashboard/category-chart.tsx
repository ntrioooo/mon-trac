"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategoryChartProps {
  data: { category: Category; total: number; percentage: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const top5 = data.slice(0, 5);

  return (
    <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
        Pengeluaran per Kategori
      </h3>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top5}
                dataKey="total"
                nameKey="category.name"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                strokeWidth={0}
              >
                {top5.map((entry, index) => (
                  <Cell key={index} fill={entry.category.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {top5.map((item) => (
            <div key={item.category.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="truncate text-xs text-[var(--color-slate)]">
                  {item.category.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--color-ink)]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
