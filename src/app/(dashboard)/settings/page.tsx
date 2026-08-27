"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSettingsStore } from "@/stores/settings-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { transactionRepository } from "@/lib/repositories/transaction-repository";
import { categoryRepository } from "@/lib/repositories/category-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/transaction";
import { formatAmountInput, parseAmountInput } from "@/lib/utils";
import {
  LogOut,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  ChevronRight,
  CreditCard,
  Target,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null);

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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserProfile({
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Pengguna",
          email: user.email,
        });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Export JSON
  const handleExportJSON = async () => {
    const data = {
      schemaVersion: 1,
      application: "MoneyTrack" as const,
      exportedAt: new Date().toISOString(),
      categories,
      transactions,
      settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `moneytrack-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.application !== "MoneyTrack" || !data.schemaVersion) {
          setImportStatus("File bukan backup MoneyTrack yang valid");
          return;
        }

        setImportStatus("Mengimpor data ke Supabase...");

        if (data.categories?.length) {
          for (const cat of data.categories) {
            try {
              await categoryRepository.create(cat);
            } catch {
              // ignore duplicate
            }
          }
        }
        if (data.transactions?.length) {
          for (const txn of data.transactions) {
            try {
              await transactionRepository.create(txn);
            } catch {
              // ignore duplicate
            }
          }
        }
        if (data.settings) {
          await settingsRepository.update(data.settings);
        }

        await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
        setImportStatus("Data berhasil diimpor ke Supabase!");
      } catch {
        setImportStatus("Gagal mengimpor data. File tidak valid.");
      }
    };
    input.click();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Amount", "Category", "Note", "Payment Method", "Created At"];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return [
        t.date,
        t.amount.toString(),
        cat?.name ?? "Unknown",
        t.note ?? "",
        PAYMENT_METHOD_LABELS[t.paymentMethod],
        t.createdAt,
      ].map((v) => `"${v.replace(/"/g, '""')}"`);
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

  // Clear all data
  const handleClearData = async () => {
    await transactionRepository.clear();
    await categoryRepository.clear();
    await settingsRepository.clear();
    await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
    setShowClearConfirm(false);
  };

  // Save budget
  const handleSaveBudget = () => {
    const value = parseAmountInput(budgetInput);
    setMonthlyBudget(value > 0 ? value : undefined);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-5 text-lg font-semibold text-[var(--color-ink)]">
        Pengaturan
      </h1>

      {/* Account */}
      <SectionTitle>Akun</SectionTitle>
      <div className="mb-4 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[var(--color-emerald)]">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-[var(--color-ink)]">
              {userProfile?.name ?? "Pengguna"}
            </div>
            <div className="truncate text-xs text-[var(--color-muted)]">
              {userProfile?.email}
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)]">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--color-rose)]"
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
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
            <Target className="h-4 w-4 text-[var(--color-emerald)]" />
            Anggaran Bulanan
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted)]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onBlur={handleSaveBudget}
                placeholder="0"
                className="w-full rounded-xl border border-[var(--color-border)] py-2.5 pl-9 pr-3 text-sm tabular-nums text-[var(--color-ink)] focus:border-[var(--color-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-emerald)]"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
            <CreditCard className="h-4 w-4 text-[var(--color-emerald)]" />
            Metode Pembayaran Default
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
              ([value, label]) => (
                <button
                  key={value}
                  onClick={() => setDefaultPaymentMethod(value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${settings.defaultPaymentMethod === value
                    ? "border-[var(--color-emerald)] bg-emerald-50 text-[var(--color-emerald-deep)] font-medium"
                    : "border-[var(--color-border)] text-[var(--color-slate)]"
                    }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Data & Backup */}
      <SectionTitle>Data & Backup</SectionTitle>
      <div className="mb-4 rounded-2xl bg-white shadow-sm divide-y divide-[var(--color-border)]">
        <SettingsButton icon={Download} label="Ekspor JSON" onClick={handleExportJSON} />
        <SettingsButton icon={Upload} label="Impor JSON" onClick={handleImportJSON} />
        <SettingsButton icon={FileSpreadsheet} label="Ekspor CSV" onClick={handleExportCSV} />
        <SettingsButton
          icon={Trash2}
          label="Hapus semua data"
          onClick={() => setShowClearConfirm(true)}
          destructive
        />
      </div>

      {importStatus && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-[var(--color-emerald-deep)]">
          {importStatus}
          <button
            onClick={() => setImportStatus(null)}
            className="ml-2 font-medium underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowClearConfirm(false)} />
          <div className="animate-fade-in relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">
              Hapus semua data?
            </h3>
            <p className="mb-5 text-sm text-[var(--color-slate)]">
              Semua transaksi, kategori custom, dan pengaturan di akun Supabase Anda akan dihapus.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-slate)]"
              >
                Batal
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 rounded-xl bg-[var(--color-rose)] py-2.5 text-sm font-medium text-white"
              >
                Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
      {children}
    </h2>
  );
}

function SettingsButton({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-sm ${destructive ? "text-[var(--color-rose)]" : "text-[var(--color-ink)]"
        }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-4 w-4 text-[var(--color-muted)]" />
    </button>
  );
}
