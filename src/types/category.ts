export type CategoryType = "expense" | "income" | "both";

export interface Category {
  id: string;
  name: string;
  type: CategoryType; // "expense" | "income" | "both"
  icon: string; // Lucide icon name
  color: string; // Hex color
  isDefault: boolean;
  createdAt: string; // ISO timestamp
  updatedAt?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: "cat-makanan", name: "Makanan", type: "expense", icon: "Utensils", color: "#EF4444", isDefault: true, createdAt: "" },
  { id: "cat-minuman", name: "Minuman", type: "expense", icon: "Coffee", color: "#F97316", isDefault: true, createdAt: "" },
  { id: "cat-transportasi", name: "Transportasi", type: "expense", icon: "Car", color: "#3B82F6", isDefault: true, createdAt: "" },
  { id: "cat-belanja", name: "Belanja", type: "expense", icon: "ShoppingCart", color: "#8B5CF6", isDefault: true, createdAt: "" },
  { id: "cat-tagihan", name: "Tagihan", type: "expense", icon: "Receipt", color: "#EC4899", isDefault: true, createdAt: "" },
  { id: "cat-hiburan", name: "Hiburan", type: "expense", icon: "Gamepad2", color: "#10B981", isDefault: true, createdAt: "" },
  { id: "cat-kesehatan", name: "Kesehatan", type: "expense", icon: "HeartPulse", color: "#14B8A6", isDefault: true, createdAt: "" },
  { id: "cat-pendidikan", name: "Pendidikan", type: "expense", icon: "GraduationCap", color: "#6366F1", isDefault: true, createdAt: "" },
  { id: "cat-rumah", name: "Rumah", type: "expense", icon: "Home", color: "#F59E0B", isDefault: true, createdAt: "" },
  { id: "cat-lainnya", name: "Lainnya", type: "both", icon: "Package", color: "#6B7280", isDefault: true, createdAt: "" },
  // Income categories
  { id: "inc-gaji", name: "Gaji", type: "income", icon: "Briefcase", color: "#10B981", isDefault: true, createdAt: "" },
  { id: "inc-bonus", name: "Bonus", type: "income", icon: "Gift", color: "#059669", isDefault: true, createdAt: "" },
  { id: "inc-freelance", name: "Freelance", type: "income", icon: "Laptop", color: "#0D9488", isDefault: true, createdAt: "" },
  { id: "inc-investasi", name: "Investasi", type: "income", icon: "TrendingUp", color: "#6366F1", isDefault: true, createdAt: "" },
  { id: "inc-penjualan", name: "Penjualan", type: "income", icon: "Tag", color: "#F59E0B", isDefault: true, createdAt: "" },
  { id: "inc-hadiah", name: "Hadiah", type: "income", icon: "Sparkles", color: "#EC4899", isDefault: true, createdAt: "" },
  { id: "inc-lainnya", name: "Pemasukan Lain", type: "income", icon: "CircleDollarSign", color: "#3B82F6", isDefault: true, createdAt: "" },
];
