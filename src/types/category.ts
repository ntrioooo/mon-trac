export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji
  color: string; // Hex color
  isDefault: boolean;
  createdAt: string; // ISO timestamp
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-makanan", name: "Makanan", icon: "Utensils", color: "#EF4444", isDefault: true, createdAt: "" },
  { id: "cat-minuman", name: "Minuman", icon: "Coffee", color: "#F97316", isDefault: true, createdAt: "" },
  { id: "cat-transportasi", name: "Transportasi", icon: "Car", color: "#3B82F6", isDefault: true, createdAt: "" },
  { id: "cat-belanja", name: "Belanja", icon: "ShoppingCart", color: "#8B5CF6", isDefault: true, createdAt: "" },
  { id: "cat-tagihan", name: "Tagihan", icon: "Receipt", color: "#EC4899", isDefault: true, createdAt: "" },
  { id: "cat-hiburan", name: "Hiburan", icon: "Gamepad2", color: "#10B981", isDefault: true, createdAt: "" },
  { id: "cat-kesehatan", name: "Kesehatan", icon: "HeartPulse", color: "#14B8A6", isDefault: true, createdAt: "" },
  { id: "cat-pendidikan", name: "Pendidikan", icon: "GraduationCap", color: "#6366F1", isDefault: true, createdAt: "" },
  { id: "cat-rumah", name: "Rumah", icon: "Home", color: "#F59E0B", isDefault: true, createdAt: "" },
  { id: "cat-lainnya", name: "Lainnya", icon: "Package", color: "#6B7280", isDefault: true, createdAt: "" },
];
