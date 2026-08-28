"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSettingsStore } from "@/stores/settings-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { db, initializeDatabase } from "@/lib/db";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/transaction";
import { formatAmountInput, parseAmountInput } from "@/lib/utils";
import {
  LogOut, Download, Upload, FileSpreadsheet, Trash2,
  ChevronRight, CreditCard, Target, User, Cloud, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { syncEngine } from "@/lib/sync-engine";

export default function SettingsPage() {
  const { data: session } = useSession();

  const settings = useSettingsStore((s) => s.settings);
  const setMonthlyBudget = useSettingsStore((s) => s.setMonthlyBudget);
  const setDefaultPaymentMethod = useSettingsStore((s) => s.setDefaultPaymentMethod);
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [budgetInput, setBudgetInput] = useState(
    settings.monthlyBudget ? formatAmountInput(settings.monthlyBudget) : ""
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const userIdentifier = session?.user?.email || session?.user?.id;
    const result = await syncEngine.syncAll(userIdentifier);
    setIsSyncing(false);

    if (result.success) {
      await loadTransactions();
      setImportStatus(`✓ Berhasil disinkronkan (${result.count} data transaksi terkirim ke Supabase)`);
    } else {
      setImportStatus(`Gagal sinkronisasi: ${result.error || "Cek koneksi internet"}`);
    }
  };

  const handleExportJSON = () => {
    const data = { schemaVersion: 1, application: "MoneyTrack" as const, exportedAt: new Date().toISOString(), categories, transactions, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneytrack-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.application !== "MoneyTrack" || !data.schemaVersion) {
          setImportStatus("File bukan backup MoneyTrack yang valid");
          return;
        }
        await db.transactions.clear();
        await db.categories.clear();
        await db.settings.clear();
        if (data.categories?.length) await db.categories.bulkPut(data.categories);
        if (data.transactions?.length) await db.transactions.bulkPut(data.transactions);
        if (data.settings) await db.settings.put(data.settings);
        await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
        setImportStatus("✓ Data berhasil diimpor");
      } catch {
        setImportStatus("Gagal mengimpor data. File tidak valid.");
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Amount", "Category", "Note", "Payment Method", "Created At"];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return [t.date, t.amount.toString(), cat?.name ?? "Unknown", t.note ?? "", PAYMENT_METHOD_LABELS[t.paymentMethod], t.createdAt]
        .map((v) => `"${v.replace(/"/g, '""')}"`);
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneytrack-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    await db.transactions.clear();
    await db.categories.clear();
    await db.settings.clear();
    await initializeDatabase();
    await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
    setShowClearConfirm(false);
  };

  const handleSaveBudget = () => {
    const value = parseAmountInput(budgetInput);
    setMonthlyBudget(value > 0 ? value : undefined);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-white">Pengaturan</h1>

      {/* Account */}
      <SectionTitle>Akun</SectionTitle>
      <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820]">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-[#F59E0B]">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {session?.user?.name ?? "Pengguna"}
            </div>
            <div className="truncate text-xs text-slate-500">{session?.user?.email}</div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#FF6B6B]"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Preferences */}
      <SectionTitle>Preferensi</SectionTitle>
      <div className="mb-4 space-y-3">
        {/* Budget */}
        <div className="rounded-2xl border border-white/8 bg-[#181820] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Target className="h-4 w-4 text-[#F59E0B]" />
            Anggaran Bulanan
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onBlur={handleSaveBudget}
              placeholder="0"
              className="w-full rounded-xl border border-white/8 bg-[#22222E] py-2.5 pl-9 pr-3 text-sm tabular-nums text-white placeholder:text-slate-600 focus:border-[#F59E0B]/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-2xl border border-white/8 bg-[#181820] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <CreditCard className="h-4 w-4 text-[#F59E0B]" />
            Metode Pembayaran Default
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setDefaultPaymentMethod(value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                  settings.defaultPaymentMethod === value
                    ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "border-white/8 text-slate-500 hover:border-white/15"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data & Backup */}
      <SectionTitle>Data & Backup</SectionTitle>
      <div className="mb-4 rounded-2xl border border-white/8 bg-[#181820] divide-y divide-white/5">
        <SettingsRow
          icon={isSyncing ? RefreshCw : Cloud}
          label={isSyncing ? "Menyinkronkan ke Supabase..." : "Sinkronkan ke Cloud (Supabase)"}
          onClick={handleManualSync}
        />
        <SettingsRow icon={Download} label="Ekspor JSON" onClick={handleExportJSON} />
        <SettingsRow icon={Upload} label="Impor JSON" onClick={handleImportJSON} />
        <SettingsRow icon={FileSpreadsheet} label="Ekspor CSV" onClick={handleExportCSV} />
        <SettingsRow icon={Trash2} label="Hapus semua data" onClick={() => setShowClearConfirm(true)} destructive />
      </div>

      {importStatus && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 px-4 py-3">
          <span className="text-sm text-[#10B981]">{importStatus}</span>
          <button onClick={() => setImportStatus(null)} className="text-xs text-slate-500 underline">Tutup</button>
        </div>
      )}

      <p className="text-center text-xs text-slate-600">Data tersimpan secara lokal di perangkat.</p>

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowClearConfirm(false)} />
          <div className="animate-fade-in relative mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#181820] p-6">
            <h3 className="mb-2 text-base font-bold text-white">Hapus semua data?</h3>
            <p className="mb-5 text-sm text-slate-400">Semua transaksi dan pengaturan lokal akan dihapus. Tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400">Batal</button>
              <button onClick={handleClearData} className="flex-1 rounded-xl bg-[#FF6B6B] py-2.5 text-sm font-bold text-white">Hapus Semua</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{children}</h2>;
}

function SettingsRow({ icon: Icon, label, onClick, destructive = false }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold", destructive ? "text-[#FF6B6B]" : "text-white")}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-4 w-4 text-slate-600" />
    </button>
  );
}
