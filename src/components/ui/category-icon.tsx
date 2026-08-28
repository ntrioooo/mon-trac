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
  CircleDot,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // PascalCase Lucide Names
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
  briefcase: Briefcase,
  plane: Plane,
  gift: Gift,
  shirt: Shirt,
  music: Music,
  phone: Phone,
  shield: Shield,
  tag: Tag,
  wallet: Wallet,
  fuel: Fuel,
  dumbbell: Dumbbell,
  bus: Bus,
  train: Train,

  // Fallback for legacy emoji strings in existing IndexedDB databases
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
  icon?: string | null;
  className?: string;
  color?: string;
}

export function CategoryIcon({
  icon,
  className = "h-5 w-5",
  color,
}: CategoryIconProps) {
  const key = (icon || "").trim();
  const IconComponent = CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP[key.toLowerCase()] || Package;

  return (
    <IconComponent
      className={className}
      style={color ? { color } : undefined}
      strokeWidth={2}
    />
  );
}
