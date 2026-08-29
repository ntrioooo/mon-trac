"use client";

import { useState } from "react";
import { ChevronRight, Plus, Wallet } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { WalletManageSheet } from "@/components/wallet/wallet-manage-sheet";
import { formatCurrency } from "@/lib/utils";
import type { Wallet as WalletType } from "@/types/wallet";
import { cn } from "@/lib/utils";

export function WalletCarousel() {
  const wallets = useWalletStore((s) => s.wallets);
  const getWalletBalance = useWalletStore((s) => s.getWalletBalance);
  const getTotalBalance = useWalletStore((s) => s.getTotalBalance);
  const transactions = useTransactionStore((s) => s.transactions);

  const [addOpen, setAddOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<WalletType | null>(null);

  const totalBalance = getTotalBalance(transactions);

  if (wallets.length === 0) return null;

  return (
    <>
      <div className="pastel-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-50">
              <Wallet className="h-4 w-4 text-violet-600" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dompet & Rekening
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold tabular-nums text-[#0F172A]">
              {formatCurrency(totalBalance)}
            </span>
            <button
              onClick={() => setAddOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
              aria-label="Tambah dompet"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Wallet List */}
        <div className="divide-y divide-slate-50">
          {wallets.map((wallet) => {
            const balance = getWalletBalance(wallet.id, transactions);
            const isNegative = balance < 0;
            return (
              <button
                key={wallet.id}
                type="button"
                onClick={() => setEditWallet(wallet)}
                className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/60 transition-colors text-left"
              >
                {/* Wallet Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: wallet.color + "18" }}
                >
                  <CategoryIcon
                    icon={wallet.icon}
                    color={wallet.color}
                    className="h-5 w-5"
                  />
                </div>

                {/* Wallet Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-[#0F172A]">{wallet.name}</p>
                    {wallet.isDefault && (
                      <span className="shrink-0 rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-600">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-400 capitalize">
                    {wallet.type === "bank" ? "Rekening Bank" :
                     wallet.type === "cash" ? "Tunai" :
                     wallet.type === "ewallet" ? "E-Wallet" :
                     wallet.type === "credit" ? "Kartu Kredit" :
                     wallet.type === "savings" ? "Tabungan" : "Lainnya"}
                  </p>
                </div>

                {/* Balance */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn(
                      "text-sm font-extrabold tabular-nums",
                      isNegative ? "text-rose-500" : "text-[#0F172A]"
                    )}
                  >
                    {isNegative ? "-" : ""}{formatCurrency(Math.abs(balance))}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Wallet Sheet */}
      <WalletManageSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        editWallet={null}
      />

      {/* Edit Wallet Sheet */}
      <WalletManageSheet
        open={!!editWallet}
        onOpenChange={(v) => { if (!v) setEditWallet(null); }}
        editWallet={editWallet}
      />
    </>
  );
}
