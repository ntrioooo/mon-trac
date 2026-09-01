"use client";

import { useRef, useState, useEffect } from "react";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";

// All tiles use violet bg — clean and unified
const TILE_COLORS = [
  "#EDE9FE", // violet
  "#EDE9FE",
  "#EDE9FE",
  "#EDE9FE",
  "#EDE9FE",
];

interface CategoryPickerProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ categories, selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {categories.map((category) => {
        const isSelected = selected === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            style={
              isSelected
                ? { border: "1.5px solid #7C3AED" }
                : { border: "1.5px solid transparent" }
            }
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl py-3 px-1 transition-all active:scale-95 bg-violet-50/70",
            )}
          >
            {/* Icon — always violet */}
            <div className="mb-1.5 flex h-8 w-8 items-center justify-center">
              <CategoryIcon
                icon={category.icon}
                color={isSelected ? "#7C3AED" : "#8B5CF6"}
                className="h-5 w-5"
              />
            </div>

            <CategoryLabel name={category.name} isSelected={isSelected} />
          </button>
        );
      })}
    </div>
  );
}

function CategoryLabel({
  name,
  isSelected,
}: {
  name: string;
  isSelected: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const textWidth = measureRef.current.getBoundingClientRect().width;
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        setIsOverflowing(textWidth > containerWidth);
      }
    };
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [name]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden text-center"
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute pointer-events-none whitespace-nowrap text-[10px] font-semibold"
      >
        {name}
      </span>

      {isOverflowing ? (
        <div className="animate-marquee-left flex shrink-0">
          <span className={cn("text-[10px] pr-3 shrink-0 whitespace-nowrap font-semibold",
            isSelected ? "text-violet-700" : "text-slate-500"
          )}>{name}</span>
          <span className={cn("text-[10px] pr-3 shrink-0 whitespace-nowrap font-semibold",
            isSelected ? "text-violet-700" : "text-slate-500"
          )}>{name}</span>
        </div>
      ) : (
        <span className={cn(
          "text-[10px] whitespace-nowrap font-semibold",
          isSelected ? "text-violet-700" : "text-slate-500"
        )}>
          {name}
        </span>
      )}
    </div>
  );
}
