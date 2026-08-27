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
  amount: number;
  type: "expense";
  categoryId: string;
  note?: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
