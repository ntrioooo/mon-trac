import { z } from "zod";

const transactionImportSchema = z.object({
  id: z.string(),
  amount: z.number().int().positive(),
  type: z.literal("expense"),
  categoryId: z.string(),
  note: z.string().optional(),
  date: z.string(),
  paymentMethod: z.enum(["cash", "bank", "debit", "credit", "ewallet"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const categoryImportSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
});

const settingsImportSchema = z.object({
  id: z.string(),
  currency: z.literal("IDR"),
  monthlyBudget: z.number().int().nonnegative().optional(),
  defaultPaymentMethod: z.enum(["cash", "bank", "debit", "credit", "ewallet"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupSchema = z.object({
  schemaVersion: z.number().int().positive(),
  application: z.enum(["MoneyTrack", "IngatMiskin", "Ingat Miskin"]),
  exportedAt: z.string(),
  categories: z.array(categoryImportSchema),
  transactions: z.array(transactionImportSchema),
  settings: settingsImportSchema,
});

export type BackupData = z.infer<typeof backupSchema>;
