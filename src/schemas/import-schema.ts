import { z } from "zod";

const walletImportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["bank", "cash", "ewallet", "credit", "savings", "other"]).default("cash"),
  initialBalance: z.number().int().default(0),
  color: z.string().default("#7C3AED"),
  icon: z.string().default("Wallet"),
  isDefault: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const transactionImportSchema = z.object({
  id: z.string(),
  amount: z.number().int().positive(),
  type: z.enum(["expense", "income", "transfer"]).default("expense"),
  categoryId: z.string(),
  walletId: z.string().optional().default("wallet-tunai"),
  toWalletId: z.string().optional(),
  note: z.string().optional(),
  date: z.string(),
  paymentMethod: z.enum(["cash", "bank", "debit", "credit", "ewallet"]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const categoryImportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["expense", "income", "both"]).optional().default("expense"),
  icon: z.string(),
  color: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const settingsImportSchema = z.object({
  id: z.string(),
  currency: z.literal("IDR"),
  monthlyBudget: z.number().int().nonnegative().optional(),
  defaultPaymentMethod: z.enum(["cash", "bank", "debit", "credit", "ewallet"]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupSchema = z.object({
  schemaVersion: z.number().int().positive(),
  application: z.enum(["JagaJajan", "MonTrac", "MoneyTrack", "IngatMiskin", "Ingat Miskin"]),
  exportedAt: z.string(),
  wallets: z.array(walletImportSchema).optional().default([]),
  categories: z.array(categoryImportSchema),
  transactions: z.array(transactionImportSchema),
  settings: settingsImportSchema,
});

export type BackupData = z.infer<typeof backupSchema>;
