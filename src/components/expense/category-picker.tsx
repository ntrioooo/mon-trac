"use client";

import { useRef, useState, useEffect } from "react";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";

interface CategoryPickerProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ categories, selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {categories.map((category) => {
        const isSelected = selected === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border p-2 transition-all active:scale-95 overflow-hidden w-full",
              isSelected
                ? "border-violet-600 bg-violet-50/70 shadow-xs"
                : "border-transparent bg-transparent hover:bg-slate-50"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center">
              <CategoryIcon
                icon={category.icon}
                color="#7C3AED"
                className="h-5.5 w-5.5"
              />
            </div>

            {/* Smart Dynamic Category Label */}
            <CategoryLabel
              name={category.name}
              isSelected={isSelected}
            />
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
        // Text is strictly overflowing if its natural unconstrained width exceeds container width
        setIsOverflowing(textWidth > containerWidth);
      }
    };

    checkOverflow();

    // Use ResizeObserver so when user resizes viewport or screen gets wider/narrower, it updates instantly
    const observer = new ResizeObserver(() => {
      checkOverflow();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("resize", checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [name]);

  return (
    <div
      ref={containerRef}
      className="relative mt-1 w-full overflow-hidden text-center flex justify-center px-0.5"
    >
      {/* Hidden off-screen text used solely for accurate, persistent width measurement on any screen size */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute pointer-events-none whitespace-nowrap text-[10px] leading-tight font-semibold"
      >
        {name}
      </span>

      {isOverflowing ? (
        // Overflows on small screen -> Smooth Right-to-Left Marquee
        <div className="animate-marquee-left flex shrink-0">
          <span
            className={cn(
              "text-[10px] leading-tight pr-4 shrink-0 whitespace-nowrap",
              isSelected ? "font-bold text-violet-700" : "font-semibold text-slate-600"
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              "text-[10px] leading-tight pr-4 shrink-0 whitespace-nowrap",
              isSelected ? "font-bold text-violet-700" : "font-semibold text-slate-600"
            )}
          >
            {name}
          </span>
        </div>
      ) : (
        // Fits within container on large screen -> 100% Stationary (Diam), centered & clean
        <span
          className={cn(
            "text-[10px] leading-tight inline-block whitespace-nowrap text-center",
            isSelected ? "font-bold text-violet-700" : "font-semibold text-slate-600"
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
}
