"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn, generateId, formatCurrency } from "@/lib/utils";
import type { Wallet, WalletType } from "@/types/wallet";
import { WALLET_TYPE_LABELS } from "@/types/wallet";
import { parseAmountInput, formatAmountInput } from "@/lib/utils";

interface WalletManageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editWallet?: Wallet | null;
  onSuccess?: () => void;
}

const WALLET_ICONS = [
  { icon: "Wallet", label: "Dompet" },
  { icon: "Building2", label: "Bank" },
  { icon: "Smartphone", label: "E-Wallet" },
  { icon: "CreditCard", label: "Kartu" },
  { icon: "PiggyBank", label: "Tabungan" },
  { icon: "Landmark", label: "Investasi" },
  { icon: "Briefcase", label: "Bisnis" },
  { icon: "Package", label: "Lainnya" },
];

const WALLET_COLORS = [
  "#7C3AED", "#10B981", "#3B82F6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#8B5CF6",
  "#0D9488", "#6366F1", "#F97316", "#6B7280",
];

const WALLET_TYPES: WalletType[] = ["cash", "bank", "ewallet", "credit", "savings", "other"];

export function WalletManageSheet({
  open,
  onOpenChange,
  editWallet,
  onSuccess,
}: WalletManageSheetProps) {
  const isEditing = !!editWallet;
  const { addWallet, updateWallet, deleteWallet } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [initialBalanceRaw, setInitialBalanceRaw] = useState("");
  const [color, setColor] = useState("#7C3AED");
  const [icon, setIcon] = useState("Wallet");

  useEffect(() => {
    if (open) {
      setShowDeleteConfirm(false);
      if (editWallet) {
        setName(editWallet.name);
        setType(editWallet.type);
        setInitialBalanceRaw(editWallet.initialBalance > 0 ? formatAmountInput(editWallet.initialBalance) : "");
        setColor(editWallet.color);
        setIcon(editWallet.icon);
      } else {
        setName("");
        setType("cash");
        setInitialBalanceRaw("");
        setColor("#7C3AED");
        setIcon("Wallet");
      }
    }
  }, [open, editWallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const initialBalance = parseAmountInput(initialBalanceRaw);

      if (isEditing && editWallet) {
        await updateWallet(editWallet.id, { name: name.trim(), type, initialBalance, color, icon });
      } else {
        await addWallet({
          id: generateId(),
          name: name.trim(),
          type,
          initialBalance,
          color,
          icon,
          isDefault: false,
          createdAt: now,
          updatedAt: now,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save wallet:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editWallet) return;
    setIsSubmitting(true);
    try {
      await deleteWallet(editWallet.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete wallet:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t border-slate-100 bg-white shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-base font-extrabold text-[#0F172A]">
            {isEditing ? "Ubah Dompet" : "Tambah Dompet"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Wallet Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Nama Dompet / Rekening
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bank Mandiri, GoPay, Dompet Harian..."
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Saldo Awal
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-violet-500 focus-within:bg-white transition-colors">
              <span className="text-sm font-bold text-slate-400 shrink-0">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={initialBalanceRaw}
                onChange={(e) => setInitialBalanceRaw(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
                placeholder="0"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-bold text-[#0F172A] placeholder:text-slate-300 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Wallet Type */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tipe Dompet
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
                    type === t
                      ? "border-violet-600 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {WALLET_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ikon
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_ICONS.map(({ icon: i, label }) => {
                const active = icon === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                      active
                        ? "border-violet-600 bg-violet-50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                    title={label}
                  >
                    <CategoryIcon icon={i} color={active ? "#7C3AED" : color} className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Warna
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((c) => {
                const active = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {active && (
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ backgroundColor: color + "18" }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: color + "25" }}
            >
              <CategoryIcon icon={icon} color={color} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A]">
                {name || "Nama Dompet"}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {WALLET_TYPE_LABELS[type]}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn(
              "w-full rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-md",
              isSubmitting || !name.trim()
                ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                : "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-violet-500/20 active:scale-[0.98]"
            )}
          >
            {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Dompet"}
          </button>

          {/* Delete Button (Edit Only) */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-2xl border border-rose-200 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
            >
              Hapus Dompet
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Yakin ingin menghapus dompet ini? Riwayat transaksinya tetap tersimpan.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-extrabold text-white hover:bg-rose-600 transition-colors disabled:opacity-60"
                >
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
