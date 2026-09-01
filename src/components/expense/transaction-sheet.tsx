"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Trash2, Tag, FileText } from "lucide-react";
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

  useEffect(() => {
    if (open) {
      form.reset(getInitialValues());
      setShowDeleteConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTransaction]);

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === "both"
  );

  useEffect(() => {
    const currentCategoryId = form.getValues("categoryId");
    const isCompatible = filteredCategories.some((c) => c.id === currentCategoryId);
    if (!isCompatible && currentCategoryId) form.setValue("categoryId", "");
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
            amount: data.amount, type: data.type, categoryId: data.categoryId,
            walletId: data.walletId, toWalletId: data.toWalletId,
            note: data.note || undefined, date: data.date,
            paymentMethod: data.paymentMethod, updatedAt: now,
          },
          userIdentifier
        );
      } else {
        await addTransaction(
          {
            id: generateId(), amount: data.amount, type: data.type,
            categoryId: data.categoryId, walletId: data.walletId, toWalletId: data.toWalletId,
            note: data.note || undefined, date: data.date,
            paymentMethod: data.paymentMethod, createdAt: now, updatedAt: now,
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

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="animate-fade-in absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(15,23,42,0.5)" }}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[96dvh] overflow-y-auto bg-white shadow-2xl"
        style={{
          borderRadius: "1.5rem 1.5rem 0 0",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-base font-bold text-slate-800">
            {isEditing ? "Ubah Transaksi" : isExpense ? "Tambah Pengeluaran" : "Tambah Pemasukan"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Type Switcher — violet expense, green income ── */}
        <div className="px-5 pb-3">
          <div className="flex rounded-xl overflow-hidden bg-slate-100 p-1 gap-1">
            {(["expense", "income"] as TransactionType[]).map((t) => {
              const active = txType === t;
              const isExp = t === "expense";
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => form.setValue("type", t)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-bold transition-all",
                    active
                      ? isExp
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {isExp ? "✦ Pengeluaran" : "✦ Pemasukan"}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 pb-5 space-y-4">
          {/* Amount */}
          <AmountInput
            value={amount}
            onChange={(val) => form.setValue("amount", val, { shouldValidate: true })}
            error={form.formState.errors.amount?.message}
            type={txType}
          />

          {/* Wallet Selector */}
          {wallets.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Dari Dompet
              </p>
              <div className="flex flex-wrap gap-2">
                {wallets.map((w: Wallet) => {
                  const active = walletId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() =>
                        form.setValue("walletId", w.id, { shouldValidate: true })
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                        active
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-white text-slate-500"
                      )}
                    >
                      <CategoryIcon
                        icon={w.icon}
                        color={active ? "#7C3AED" : "#94A3B8"}
                        className="h-3.5 w-3.5"
                      />
                      {w.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Kategori
            </p>
            <CategoryPicker
              categories={filteredCategories}
              selected={form.watch("categoryId")}
              onSelect={(id) =>
                form.setValue("categoryId", id, { shouldValidate: true })
              }
            />
            {form.formState.errors.categoryId && (
              <p className="mt-1.5 text-xs font-bold text-rose-500">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Catatan */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FileText className="h-3 w-3" strokeWidth={2.5} />
              Catatan
              <span className="font-medium normal-case text-slate-300">(opsional)</span>
            </label>
            <input
              {...form.register("note")}
              type="text"
              placeholder="Makan siang, bensin, gaji bulanan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:border-violet-400 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Calendar className="h-3 w-3" strokeWidth={2.5} />
              Tanggal
            </label>
            <input
              {...form.register("date")}
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-violet-400 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Save Button — violet (expense) or green (income) */}
          <button
            type="submit"
            disabled={isSubmitting || amount === 0}
            className={cn(
              "w-full rounded-xl py-3.5 text-sm font-bold transition-all",
              isSubmitting || amount === 0
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : isExpense
                ? "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99]"
                : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.99]"
            )}
            style={
              isSubmitting || amount === 0
                ? {}
                : isExpense
                ? { boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }
                : { boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }
            }
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
              ? "Simpan Perubahan"
              : isExpense
              ? "Catat Pengeluaran"
              : "Catat Pemasukan"}
          </button>

          {/* Delete */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-400 hover:border-rose-200 hover:text-rose-400 transition-colors"
            >
              Hapus Transaksi
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
              <p className="mb-3 text-sm font-bold text-center text-slate-700">
                Yakin ingin menghapus?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white bg-rose-500 disabled:opacity-60"
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
