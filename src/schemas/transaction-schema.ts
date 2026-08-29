import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["expense", "income", "transfer"]),
  amount: z
    .number()
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0"),
  categoryId: z.string().min(1, "Pilih kategori"),
  walletId: z.string().min(1, "Pilih dompet"),
  toWalletId: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1, "Tanggal diperlukan"),
  paymentMethod: z.enum(["cash", "bank", "debit", "credit", "ewallet"]).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
