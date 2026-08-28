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
import { cn, getToday } from "@/lib/utils";
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
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // silent — local op
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
        className="animate-fade-in absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#181820]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <h2 className="text-base font-bold text-white">Tambah Pengeluaran</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-slate-400 hover:bg-white/12"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 py-4">
          {/* Amount */}
          <div className="mb-5">
            <AmountInput
              value={amount}
              onChange={(val) => form.setValue("amount", val, { shouldValidate: true })}
              error={form.formState.errors.amount?.message}
            />
          </div>

          {/* Category Picker */}
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Kategori
            </p>
            <CategoryPicker
              categories={categories}
              selected={form.watch("categoryId")}
              onSelect={(id) => form.setValue("categoryId", id, { shouldValidate: true })}
            />
            {form.formState.errors.categoryId && (
              <p className="mt-1.5 text-xs text-[#FF6B6B]">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Optional fields toggle */}
          {!showOptional && (
            <button
              type="button"
              onClick={() => setShowOptional(true)}
              className="mb-4 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300"
            >
              <StickyNote className="h-3.5 w-3.5" />
              Tambah catatan, tanggal, atau metode pembayaran
            </button>
          )}

          {/* Optional fields */}
          {showOptional && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Catatan <span className="font-normal normal-case text-slate-600">(opsional)</span>
                </label>
                <input
                  {...form.register("note")}
                  type="text"
                  placeholder="Makan siang di kantor..."
                  className="w-full rounded-xl border border-white/8 bg-[#22222E] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> Tanggal
                </label>
                <input
                  {...form.register("date")}
                  type="date"
                  className="w-full rounded-xl border border-white/8 bg-[#22222E] px-3.5 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <CreditCard className="h-3.5 w-3.5" /> Metode Pembayaran
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => form.setValue("paymentMethod", value)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        form.watch("paymentMethod") === value
                          ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                          : "border-white/8 text-slate-500"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || amount === 0}
            className={cn(
              "mt-2 w-full rounded-xl py-3.5 text-sm font-bold transition-all",
              isSubmitting || amount === 0
                ? "cursor-not-allowed bg-white/8 text-slate-600"
                : "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_16px_rgba(245,158,11,0.3)]"
            )}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
          </button>
        </form>
      </div>
    </div>
  );
}
