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
import { cn, getToday, formatCurrency } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/transaction";

interface ExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExpenseSheet({ open, onOpenChange, onSuccess }: ExpenseSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // Reset form when opened
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
      await addTransaction({
        id: crypto.randomUUID(),
        amount: data.amount,
        type: "expense",
        categoryId: data.categoryId,
        note: data.note || undefined,
        date: data.date,
        paymentMethod: data.paymentMethod,
        createdAt: now,
        updatedAt: now,
      });

      // Update default payment method if changed
      if (data.paymentMethod !== settings.defaultPaymentMethod) {
        useSettingsStore.getState().setDefaultPaymentMethod(data.paymentMethod);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled silently — local operation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const amount = form.watch("amount");
  const selectedCategory = form.watch("categoryId");

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="animate-fade-in absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Tambah Pengeluaran
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-slate)] hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 py-4">
          {/* Amount — The hero */}
          <div className="mb-6">
            <AmountInput
              value={amount}
              onChange={(val) => form.setValue("amount", val, { shouldValidate: true })}
              error={form.formState.errors.amount?.message}
            />
          </div>

          {/* Category Picker */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--color-slate)]">
              Kategori
            </label>
            <CategoryPicker
              categories={categories}
              selected={selectedCategory}
              onSelect={(id) => form.setValue("categoryId", id, { shouldValidate: true })}
            />
            {form.formState.errors.categoryId && (
              <p className="mt-1.5 text-xs text-[var(--color-rose)]">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Optional fields toggle */}
          {!showOptional && (
            <button
              type="button"
              onClick={() => setShowOptional(true)}
              className="mb-4 flex items-center gap-2 text-sm text-[var(--color-slate)] hover:text-[var(--color-ink)]"
            >
              <StickyNote className="h-4 w-4" />
              Tambah catatan, ubah tanggal, atau metode pembayaran
            </button>
          )}

          {/* Optional Fields */}
          {showOptional && (
            <div className="mb-4 space-y-3">
              {/* Note */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-slate)]">
                  Catatan <span className="font-normal text-[var(--color-muted)]">(opsional)</span>
                </label>
                <input
                  {...form.register("note")}
                  type="text"
                  placeholder="Makan siang di kantor"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-emerald)]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-[var(--color-slate)]">
                  <Calendar className="h-4 w-4" /> Tanggal
                </label>
                <input
                  {...form.register("date")}
                  type="date"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-emerald)]"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-[var(--color-slate)]">
                  <CreditCard className="h-4 w-4" /> Metode Pembayaran
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => form.setValue("paymentMethod", value)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                          form.watch("paymentMethod") === value
                            ? "border-[var(--color-emerald)] bg-emerald-50 text-[var(--color-emerald-deep)] font-medium"
                            : "border-[var(--color-border)] text-[var(--color-slate)] hover:border-gray-300"
                        )}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Button — Large, prominent, thumb-friendly */}
          <button
            type="submit"
            disabled={isSubmitting || amount === 0}
            className={cn(
              "mt-2 w-full rounded-xl py-3.5 text-base font-semibold text-white transition-colors",
              isSubmitting || amount === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-deep)] active:bg-[var(--color-emerald-deep)]"
            )}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}
