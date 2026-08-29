"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormValues } from "@/schemas/transaction-schema";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useWalletStore } from "@/stores/wallet-store";
import { AmountInput } from "./amount-input";
import { CategoryPicker } from "./category-picker";
import { cn, getToday, generateId } from "@/lib/utils";
import { useSession } from "next-auth/react";
import type { Transaction, TransactionType } from "@/types/transaction";
import type { Wallet } from "@/types/wallet";
import { CategoryIcon } from "@/components/ui/category-icon";

interface TransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** If provided, the sheet opens in Edit mode with pre-populated data. */
  editTransaction?: Transaction | null;
}

export function TransactionSheet({
  open,
  onOpenChange,
  onSuccess,
  editTransaction,
}: TransactionSheetProps) {
  const isEditing = !!editTransaction;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);

  const { data: session } = useSession();

  const defaultWallet = wallets.find((w) => w.isDefault) ?? wallets[0];

  const getInitialValues = (): TransactionFormValues => ({
    type: editTransaction?.type ?? "expense",
    amount: editTransaction?.amount ?? 0,
    categoryId: editTransaction?.categoryId ?? "",
    walletId: editTransaction?.walletId ?? defaultWallet?.id ?? "",
    note: editTransaction?.note ?? "",
    date: editTransaction?.date ?? getToday(),
    paymentMethod: editTransaction?.paymentMethod ?? undefined,
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getInitialValues(),
  });

  const txType = form.watch("type") as TransactionType;
  const amount = form.watch("amount");
  const walletId = form.watch("walletId");

  // Reset form whenever the sheet opens or the edit target changes
  useEffect(() => {
    if (open) {
      form.reset(getInitialValues());
      setShowDeleteConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTransaction]);

  // Filter categories by current transaction type
  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === "both"
  );

  // Clear category selection if it doesn't match the new type
  useEffect(() => {
    const currentCategoryId = form.getValues("categoryId");
    const isCompatible = filteredCategories.some((c) => c.id === currentCategoryId);
    if (!isCompatible && currentCategoryId) {
      form.setValue("categoryId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType]);

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const userIdentifier = session?.user?.email || session?.user?.id || "local-user";

      if (isEditing && editTransaction) {
        await updateTransaction(
          editTransaction.id,
          {
            amount: data.amount,
            type: data.type,
            categoryId: data.categoryId,
            walletId: data.walletId,
            toWalletId: data.toWalletId,
            note: data.note || undefined,
            date: data.date,
            paymentMethod: data.paymentMethod,
            updatedAt: now,
          },
          userIdentifier
        );
      } else {
        await addTransaction(
          {
            id: generateId(),
            amount: data.amount,
            type: data.type,
            categoryId: data.categoryId,
            walletId: data.walletId,
            toWalletId: data.toWalletId,
            note: data.note || undefined,
            date: data.date,
            paymentMethod: data.paymentMethod,
            createdAt: now,
            updatedAt: now,
          },
          userIdentifier
        );
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editTransaction) return;
    setIsSubmitting(true);
    try {
      await deleteTransaction(editTransaction.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const isExpense = txType === "expense";
  const typeColor = isExpense ? "text-rose-500" : "text-emerald-600";
  const typeBg = isExpense ? "bg-rose-500" : "bg-emerald-500";
  const typeActiveBg = isExpense ? "bg-rose-50 text-rose-700 border-rose-500" : "bg-emerald-50 text-emerald-700 border-emerald-500";

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[96dvh] overflow-y-auto rounded-t-3xl border-t border-slate-100 bg-white shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-base font-extrabold text-[#0F172A]">
            {isEditing ? "Ubah Transaksi" : "Tambah Transaksi"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          {/* ── Type Switcher ── */}
          <div className="flex rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-1 gap-1">
            {(["expense", "income"] as TransactionType[]).map((t) => {
              const active = txType === t;
              const label = t === "expense" ? "(-) Pengeluaran" : "(+) Pemasukan";
              const activeCls =
                t === "expense"
                  ? "bg-white border border-rose-400 text-rose-600 shadow-xs"
                  : "bg-white border border-emerald-400 text-emerald-600 shadow-xs";
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => form.setValue("type", t)}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-xs font-extrabold transition-all",
                    active ? activeCls : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Amount Input ── */}
          <div>
            <AmountInput
              value={amount}
              onChange={(val) => form.setValue("amount", val, { shouldValidate: true })}
              error={form.formState.errors.amount?.message}
              type={txType}
            />
          </div>

          {/* ── Wallet Selector ── */}
          {wallets.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isExpense ? "Dari Dompet" : "Ke Dompet"}
              </p>
              <div className="flex flex-wrap gap-2">
                {wallets.map((w: Wallet) => {
                  const active = walletId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => form.setValue("walletId", w.id, { shouldValidate: true })}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all",
                        active
                          ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <CategoryIcon
                        icon={w.icon}
                        color={active ? "#7C3AED" : w.color}
                        className="h-3.5 w-3.5"
                      />
                      {w.name}
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.walletId && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {form.formState.errors.walletId.message}
                </p>
              )}
            </div>
          )}

          {/* ── Category Picker ── */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kategori
            </p>
            <CategoryPicker
              categories={filteredCategories}
              selected={form.watch("categoryId")}
              onSelect={(id) => form.setValue("categoryId", id, { shouldValidate: true })}
            />
            {form.formState.errors.categoryId && (
              <p className="mt-1.5 text-xs font-semibold text-rose-500">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {/* ── Catatan (Directly Visible) ── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Catatan{" "}
              <span className="font-normal normal-case text-slate-400">(opsional)</span>
            </label>
            <input
              {...form.register("note")}
              type="text"
              placeholder="Makan siang, bensin, gaji bulanan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* ── Tanggal (Directly Visible) ── */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-violet-500" />
              Tanggal
            </label>
            <input
              {...form.register("date")}
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-violet-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* ── Save Button ── */}
          <button
            type="submit"
            disabled={isSubmitting || amount === 0}
            className={cn(
              "w-full rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-md",
              isSubmitting || amount === 0
                ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                : isExpense
                  ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-violet-500/20 active:scale-[0.98]"
                  : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-[0.98]"
            )}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : isExpense
                  ? "Catat Pengeluaran"
                  : "Catat Pemasukan"}
          </button>

          {/* ── Delete Button (Edit Mode Only) ── */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-2xl border border-rose-200 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
            >
              Hapus Transaksi
            </button>
          )}

          {/* ── Delete Confirmation ── */}
          {isEditing && showDeleteConfirm && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Yakin ingin menghapus transaksi ini?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2.5 text-sm font-extrabold text-white hover:bg-rose-600 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
