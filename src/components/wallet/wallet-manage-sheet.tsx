"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn, generateId, formatAmountInput, parseAmountInput } from "@/lib/utils";
import type { Wallet, WalletType } from "@/types/wallet";
import { WALLET_TYPE_LABELS } from "@/types/wallet";

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
  "#7B61FF", "#4ECDC4", "#4CC9F0", "#FF6B6B",
  "#FFD93D", "#4ADE80", "#F97316", "#EC4899",
  "#A855F7", "#0EA5E9", "#14B8A6", "#6B7280",
];

const WALLET_TYPES: WalletType[] = ["cash", "bank", "ewallet", "credit", "savings", "other"];

import { useSession } from "next-auth/react";

export function WalletManageSheet({
  open,
  onOpenChange,
  editWallet,
  onSuccess,
}: WalletManageSheetProps) {
  const { data: session } = useSession();
  const userIdentifier = session?.user?.email || session?.user?.id;
  const isEditing = !!editWallet;
  const { addWallet, updateWallet, deleteWallet } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [initialBalanceRaw, setInitialBalanceRaw] = useState("");
  const [color, setColor] = useState("#7B61FF");
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
        setColor("#7B61FF");
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
        await updateWallet(
          editWallet.id,
          { name: name.trim(), type, initialBalance, color, icon },
          userIdentifier
        );
      } else {
        await addWallet(
          {
            id: generateId(),
            name: name.trim(),
            type,
            initialBalance,
            color,
            icon,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          },
          userIdentifier
        );
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
        className="animate-fade-in absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto bg-white shadow-2xl"
        style={{
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-14 rounded-full bg-[rgba(255,220,195,0.8)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,220,195,0.5)]">
          <h2 className="text-base font-black text-[#1A1A2E]">
            {isEditing ? "Edit Dompet" : "Tambah Dompet"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-[#FFF8F3] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
          {/* Live Preview */}
          <div
            className="flex items-center gap-3 rounded-[var(--radius)] p-4 transition-all"
            style={{ backgroundColor: color + "12" }}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: color + "25" }}
            >
              <CategoryIcon icon={icon} color={color} className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-black text-[#1A1A2E]">
                {name || "Nama Dompet"}
              </p>
              <p className="text-xs font-semibold" style={{ color }}>
                {WALLET_TYPE_LABELS[type]}
              </p>
              {initialBalanceRaw && (
                <p className="text-xs font-bold text-slate-500">
                  Saldo Awal: Rp {initialBalanceRaw}
                </p>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              🎨 Warna
            </label>
            <div className="flex flex-wrap gap-2.5">
              {WALLET_COLORS.map((c) => {
                const active = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-full transition-all",
                      active ? "scale-110 ring-2 ring-offset-2" : "hover:scale-105"
                    )}
                    style={{
                      backgroundColor: c,
                      ...(active ? { ringColor: c } : {}),
                    }}
                  >
                    {active && (
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              🎯 Ikon
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_ICONS.map(({ icon: i, label }) => {
                const active = icon === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all"
                    style={
                      active
                        ? { borderColor: color, backgroundColor: color + "15" }
                        : { borderColor: "rgba(255,220,195,0.5)", backgroundColor: "#FFF8F3" }
                    }
                    title={label}
                  >
                    <CategoryIcon icon={i} color={active ? color : "#94A3B8"} className="h-5.5 w-5.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet Name */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              📛 Nama Dompet / Rekening
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bank Mandiri, GoPay, Dompet Harian..."
              required
              className="w-full rounded-2xl border-2 border-[rgba(255,220,195,0.6)] bg-[#FFF8F3] px-4 py-2.5 text-sm font-bold text-[#1A1A2E] placeholder:text-slate-300 focus:bg-white focus:outline-none transition-all"
              style={{ "": "" } as React.CSSProperties}
              onFocus={(e) => (e.target.style.borderColor = color)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,220,195,0.6)")}
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              💰 Saldo Awal
            </label>
            <div
              className="flex items-center gap-2 rounded-2xl border-2 border-[rgba(255,220,195,0.6)] bg-[#FFF8F3] px-4 transition-all focus-within:bg-white"
              style={{}}
              onFocus={(e) => {
                const border = e.currentTarget;
                border.style.borderColor = color;
              }}
              onBlur={(e) => {
                const border = e.currentTarget;
                border.style.borderColor = "rgba(255,220,195,0.6)";
              }}
            >
              <span className="text-sm font-bold text-slate-400 shrink-0">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={initialBalanceRaw}
                onChange={(e) =>
                  setInitialBalanceRaw(
                    e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  )
                }
                placeholder="0"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-bold text-[#1A1A2E] placeholder:text-slate-300 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Wallet Type */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              🏦 Tipe Dompet
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="rounded-[var(--radius-pill)] border-2 px-3.5 py-1.5 text-xs font-bold transition-all"
                  style={
                    type === t
                      ? { borderColor: color, backgroundColor: color + "15", color }
                      : {
                        borderColor: "rgba(255,220,195,0.5)",
                        backgroundColor: "#FFF8F3",
                        color: "#64748B",
                      }
                  }
                >
                  {WALLET_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn(
              "w-full rounded-[var(--radius)] py-4 text-sm font-black transition-all",
              isSubmitting || !name.trim()
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "text-white"
            )}
            style={
              isSubmitting || !name.trim()
                ? {}
                : {
                  background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                  boxShadow: `0 6px 20px ${color}40`,
                }
            }
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Tambah Dompet"}
          </button>

          {/* Delete Button (Edit Only) */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-[var(--radius)] border-2 border-[rgba(255,107,107,0.3)] py-3 text-sm font-bold text-[#FF6B6B] hover:bg-[#FFF0F0] transition-colors"
            >
              Hapus Dompet
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div
              className="rounded-[var(--radius)] border-2 p-4"
              style={{ borderColor: "rgba(255,107,107,0.3)", backgroundColor: "#FFF8F8" }}
            >
              <p className="mb-3 text-sm font-bold text-[#1A1A2E] text-center">
                😱 Yakin hapus dompet ini? Riwayat transaksi tetap tersimpan.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-2xl border-2 border-[rgba(255,220,195,0.6)] bg-white py-2.5 text-sm font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl py-2.5 text-sm font-black text-white transition-colors disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)" }}
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
