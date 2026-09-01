export type TransactionType = "expense" | "income" | "transfer";
export type PaymentMethod = "cash" | "bank" | "debit" | "credit" | "ewallet";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Tunai",
  bank: "Bank",
  debit: "Debit",
  credit: "Credit Card",
  ewallet: "E-Wallet",
};

export interface Transaction {
  id: string;
  amount: number; // Positive integer IDR
  type: TransactionType; // "expense" | "income" | "transfer"
  categoryId: string;
  walletId: string; // Source wallet (for expense/income) or from-wallet (for transfer)
  toWalletId?: string; // Destination wallet (for transfer only)
  note?: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod?: PaymentMethod; // Optional, kept for backward compat
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
