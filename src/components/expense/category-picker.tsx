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
              "relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition-all",
              isSelected
                ? "border-[var(--color-emerald)] bg-emerald-50"
                : "border-transparent bg-gray-50 hover:bg-gray-100 active:bg-gray-100"
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-emerald)] text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </div>
            )}
            <div className="flex h-8 w-8 items-center justify-center">
              <CategoryIcon
                icon={category.icon}
                color={category.color}
                className="h-6 w-6"
              />
            </div>
            <span
              className={cn(
                "text-xs leading-tight",
                isSelected
                  ? "font-medium text-[var(--color-emerald-deep)]"
                  : "text-[var(--color-slate)]"
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
