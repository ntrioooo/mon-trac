"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategoryChartProps {
  data: { category: Category; total: number; percentage: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const top5 = data.slice(0, 5);

  return (
    <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820] p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Per Kategori
      </p>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top5}
                dataKey="total"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
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
        <div className="flex-1 space-y-2">
          {top5.map((item) => (
            <div key={item.category.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="truncate text-xs text-slate-400">
                  {item.category.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-white">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
