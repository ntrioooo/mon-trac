"use client";

import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";

interface CategoryPickerProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ categories, selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-5">
      {categories.map((category) => {
        const isSelected = selected === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border p-2 transition-all active:scale-95",
              isSelected
                ? "border-[#F59E0B] bg-[#F59E0B]/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "border-white/5 bg-[#22222E] hover:border-white/10 hover:bg-[#2A2A38]"
            )}
          >
            {isSelected && (
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] shadow-md">
                <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />
              </div>
            )}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <CategoryIcon
                icon={category.icon}
                color={category.color}
                className="h-5 w-5"
              />
            </div>
            <span
              className={cn(
                "mt-1 w-full truncate text-center text-[10px] font-semibold leading-tight",
                isSelected ? "text-[#F59E0B]" : "text-slate-400"
              )}
            >
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
