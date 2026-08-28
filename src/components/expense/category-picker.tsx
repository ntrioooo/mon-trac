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
              "relative flex flex-col items-center justify-center rounded-2xl border p-2.5 transition-all active:scale-95",
              isSelected
                ? "border-violet-600 bg-violet-50/70 shadow-xs"
                : "border-transparent bg-transparent hover:bg-slate-50"
            )}
          >
            {isSelected && (
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white shadow-xs">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </div>
            )}
            <div className="flex h-9 w-9 items-center justify-center">
              <CategoryIcon
                icon={category.icon}
                color="#7C3AED"
                className="h-6 w-6"
              />
            </div>
            <span
              className={cn(
                "mt-1 w-full truncate text-center text-[10px] leading-tight",
                isSelected ? "font-bold text-violet-700" : "font-semibold text-slate-600"
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
