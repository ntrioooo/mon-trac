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
    <div className="category-grid">
      {categories.map((category) => {
        const isSelected = selected === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-all",
              isSelected
                ? "border-[#F59E0B]/60 bg-[#F59E0B]/10"
                : "border-transparent bg-[#22222E] hover:bg-[#2A2A38]"
            )}
          >
            {isSelected && (
              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F59E0B]">
                <Check className="h-3 w-3 text-black" strokeWidth={3} />
              </div>
            )}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <CategoryIcon icon={category.icon} color={category.color} className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold leading-tight text-center",
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
