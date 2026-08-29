export type WalletType = "bank" | "cash" | "ewallet" | "credit" | "savings" | "other";

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  bank: "Rekening Bank",
  cash: "Tunai",
  ewallet: "E-Wallet",
  credit: "Kartu Kredit",
  savings: "Tabungan",
  other: "Lainnya",
};

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  initialBalance: number; // Integer IDR, e.g. 2000000
  color: string; // Hex color, e.g. "#7C3AED"
  icon: string; // Lucide icon name, e.g. "Building2", "Wallet", "Smartphone"
  isDefault?: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export const DEFAULT_WALLETS: Omit<Wallet, "createdAt" | "updatedAt">[] = [
  {
    id: "wallet-tunai",
    name: "Dompet Tunai",
    type: "cash",
    initialBalance: 0,
    color: "#10B981",
    icon: "Wallet",
    isDefault: true,
  },
  {
    id: "wallet-bank",
    name: "Rekening Bank",
    type: "bank",
    initialBalance: 0,
    color: "#7C3AED",
    icon: "Building2",
    isDefault: false,
  },
  {
    id: "wallet-ewallet",
    name: "E-Wallet",
    type: "ewallet",
    initialBalance: 0,
    color: "#06B6D4",
    icon: "Smartphone",
    isDefault: false,
  },
];
