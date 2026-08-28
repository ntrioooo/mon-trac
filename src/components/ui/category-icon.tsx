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
  Film,
  Zap,
  Briefcase,
  Plane,
  Gift,
  Shirt,
  Music,
  Phone,
  Shield,
  Tag,
  Wallet,
  Fuel,
  Dumbbell,
  Bus,
  Train,
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
  Film,
  Zap,
  Briefcase,
  Plane,
  Gift,
  Shirt,
  Music,
  Phone,
  Shield,
  Tag,
  Wallet,
  Fuel,
  Dumbbell,
  Bus,
  Train,

  // Lowercase aliases
  utensils: Utensils,
  coffee: Coffee,
  car: Car,
  shoppingcart: ShoppingCart,
  receipt: Receipt,
  gamepad2: Gamepad2,
  heartpulse: HeartPulse,
  graduationcap: GraduationCap,
  home: Home,
  package: Package,
  film: Film,
  zap: Zap,

  // Fallbacks for legacy emoji data
  "🍜": Utensils,
  "🍔": Utensils,
  "☕": Coffee,
  "🚗": Car,
  "🛒": ShoppingCart,
  "🧾": Receipt,
  "🎮": Gamepad2,
  "💊": HeartPulse,
  "📚": GraduationCap,
  "🏠": Home,
  "📦": Package,
  "⚡": Zap,
  "🎬": Film,
  "🛍️": ShoppingCart,
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
  const IconComponent = CATEGORY_ICON_MAP[icon] || CATEGORY_ICON_MAP[icon.toLowerCase()] || Package;

  return (
    <IconComponent
      className={className}
      style={color ? { color } : undefined}
      strokeWidth={2}
    />
  );
}
