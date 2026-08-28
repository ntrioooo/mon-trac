"use client";

import { useState, useRef, useEffect } from "react";
import { X, Calendar, CreditCard, StickyNote } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormValues } from "@/schemas/transaction-schema";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { AmountInput } from "./amount-input";
import { CategoryPicker } from "./category-picker";
import { cn, getToday, generateId } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/transaction";

interface ExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExpenseSheet({ open, onOpenChange, onSuccess }: ExpenseSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      categoryId: "",
      note: "",
      date: getToday(),
      paymentMethod: settings.defaultPaymentMethod,
    },
  });

  const { data: session } = useSession();

  useEffect(() => {
    if (open) {
      form.reset({
        amount: 0,
        categoryId: "",
        note: "",
        date: getToday(),
        paymentMethod: settings.defaultPaymentMethod,
      });
      setShowOptional(false);
    }
  }, [open, form, settings.defaultPaymentMethod]);

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const userIdentifier = session?.user?.email || session?.user?.id || "local-user";

      await addTransaction(
        {
          id: generateId(),
          amount: data.amount,
          type: "expense",
          categoryId: data.categoryId,
          note: data.note || undefined,
          date: data.date,
          paymentMethod: data.paymentMethod,
          createdAt: now,
          updatedAt: now,
        },
        userIdentifier
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to insert transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const amount = form.watch("amount");

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t border-slate-100 bg-white shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-base font-extrabold text-[#0F172A]">Tambah Pengeluaran</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 py-4">
          {/* Amount */}
          <div className="mb-4">
            <AmountInput
              value={amount}
              onChange={(val) => form.setValue("amount", val, { shouldValidate: true })}
              error={form.formState.errors.amount?.message}
            />
          </div>

          {/* Category Picker */}
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pilih Kategori
            </p>
            <CategoryPicker
              categories={categories}
              selected={form.watch("categoryId")}
              onSelect={(id) => form.setValue("categoryId", id, { shouldValidate: true })}
            />
            {form.formState.errors.categoryId && (
              <p className="mt-1.5 text-xs font-semibold text-rose-500">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Optional fields toggle */}
          {!showOptional && (
            <button
              type="button"
              onClick={() => setShowOptional(true)}
              className="mb-4 flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              <StickyNote className="h-3.5 w-3.5" />
              Tambah catatan, tanggal, atau metode pembayaran
            </button>
          )}

          {/* Optional fields */}
          {showOptional && (
            <div className="mb-4 space-y-3 rounded-2xl bg-slate-50/80 p-3.5 sm:p-4 border border-slate-100 overflow-hidden w-full min-w-0 box-border">
              <div className="w-full min-w-0">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Catatan <span className="font-normal normal-case text-slate-400">(opsional)</span>
                </label>
                <input
                  {...form.register("note")}
                  type="text"
                  placeholder="Makan siang, bensin, dll..."
                  className="w-full max-w-full min-w-0 box-border rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-violet-600" /> Tanggal
                </label>
                <input
                  {...form.register("date")}
                  type="date"
                  className="w-full max-w-full min-w-0 box-border rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <CreditCard className="h-3.5 w-3.5 text-violet-600" /> Metode Pembayaran
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => form.setValue("paymentMethod", value)}
                      className={cn(
                        "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                        form.watch("paymentMethod") === value
                          ? "border-violet-600 bg-violet-50 text-violet-700 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button: Solid violet without gradient, text "Simpan" */}
          <button
            type="submit"
            disabled={isSubmitting || amount === 0}
            className={cn(
              "mt-2 w-full rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-md",
              isSubmitting || amount === 0
                ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                : "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-violet-500/20 active:scale-[0.98]"
            )}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
