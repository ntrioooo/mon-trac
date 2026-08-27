import type { PaymentMethod } from "./transaction";

export interface Settings {
  id: string;
  currency: "IDR";
  monthlyBudget?: number; // Integer IDR
  defaultPaymentMethod: PaymentMethod;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export const DEFAULT_SETTINGS: Settings = {
  id: "user-settings",
  currency: "IDR",
  monthlyBudget: undefined,
  defaultPaymentMethod: "cash",
  createdAt: "",
  updatedAt: "",
};
