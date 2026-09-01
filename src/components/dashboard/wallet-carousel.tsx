"use client";

import { useState } from "react";
import { Plus, WalletCards } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { WalletManageSheet } from "@/components/wallet/wallet-manage-sheet";
import { formatCurrency, cn } from "@/lib/utils";
import type { Wallet as WalletType } from "@/types/wallet";

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
      {/* Total Balance — violet hero */}
      <div
        className="rounded-2xl p-4 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
          boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
        }}
      >
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white opacity-10" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <WalletCards className="h-3.5 w-3.5 text-white/60" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Total Aset
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-white">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Tambah dompet"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Wallet chips — all violet icon bg */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
        {wallets.map((wallet) => {
          const balance = getWalletBalance(wallet.id, transactions);
          const isNegative = balance < 0;

          return (
            <button
              key={wallet.id}
              type="button"
              onClick={() => setEditWallet(wallet)}
              className="group shrink-0 flex flex-col gap-2 rounded-2xl px-4 py-3 min-w-[8rem] bg-white transition-all hover:shadow-md active:scale-[0.97] border border-slate-100"
            >
              <div className="flex items-center justify-between w-full">
                {/* Icon bg — violet */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
                  <CategoryIcon icon={wallet.icon} color="#7C3AED" className="h-4 w-4" />
                </div>
                {wallet.isDefault && (
                  <span className="text-[8px] font-bold rounded-full px-1.5 py-0.5 bg-violet-100 text-violet-600">
                    Utama
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold truncate max-w-[6rem] text-slate-600">
                  {wallet.name}
                </p>
                <p className={cn(
                  "text-sm font-bold tabular-nums",
                  isNegative ? "text-rose-500" : "text-slate-800"
                )}>
                  {isNegative ? "-" : ""}{formatCurrency(Math.abs(balance))}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <WalletManageSheet open={addOpen} onOpenChange={setAddOpen} editWallet={null} />
      <WalletManageSheet
        open={!!editWallet}
        onOpenChange={(v) => { if (!v) setEditWallet(null); }}
        editWallet={editWallet}
      />
    </>
  );
}
