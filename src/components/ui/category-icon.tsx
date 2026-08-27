import React from "react";
import {
  Utensils,
  Coffee,
  Car,
  ShoppingCart,
  Receipt,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Home,
  Package,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // Lucide names
  Utensils,
  Coffee,
  Car,
  ShoppingCart,
  Receipt,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Home,
  Package,

  // Fallback for legacy emoji data
  "🍜": Utensils,
  "☕": Coffee,
  "🚗": Car,
  "🛒": ShoppingCart,
  "🧾": Receipt,
  "🎮": Gamepad2,
  "💊": HeartPulse,
  "📚": GraduationCap,
  "🏠": Home,
  "📦": Package,
};

interface CategoryIconProps {
  icon: string;
  className?: string;
  color?: string;
}

export function CategoryIcon({
  icon,
  className = "h-5 w-5",
  color,
}: CategoryIconProps) {
  const IconComponent = CATEGORY_ICON_MAP[icon];

  if (IconComponent) {
    return (
      <IconComponent
        className={className}
        style={color ? { color } : undefined}
      />
    );
  }

  // Fallback if not recognized as mapped lucide icon
  return (
    <span className="text-base leading-none" role="img">
      {icon}
    </span>
  );
}
