"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSettingsStore } from "@/stores/settings-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { usePwaStore } from "@/stores/pwa-store";
import { db, initializeDatabase } from "@/lib/db";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/transaction";
import {
  LogOut,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  ChevronRight,
  CreditCard,
  User,
  Cloud,
  RefreshCw,
  Smartphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { syncEngine } from "@/lib/sync-engine";
import { PwaInstallModal } from "@/components/ui/pwa-install-modal";

export default function SettingsPage() {
  const { data: session } = useSession();

  const settings = useSettingsStore((s) => s.settings);
  const setDefaultPaymentMethod = useSettingsStore(
    (s) => s.setDefaultPaymentMethod,
  );
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const promptInstall = usePwaStore((s) => s.promptInstall);
  const isStandalone = usePwaStore((s) => s.isStandalone);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleInstallClick = async () => {
    await promptInstall();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const userIdentifier = session?.user?.email || session?.user?.id;
    const result = await syncEngine.syncAll(userIdentifier);
    setIsSyncing(false);

    if (result.success) {
      await Promise.all([loadTransactions(), loadSettings()]);
      setImportStatus(
        `✓ Berhasil disinkronkan (${result.count} data transaksi diproses)`,
      );
    } else {
      setImportStatus(
        `Gagal sinkronisasi: ${result.error || "Cek koneksi internet"}`,
      );
    }
  };

  const handleExportJSON = () => {
    const data = {
      schemaVersion: 1,
      application: "IngatMiskin" as const,
      exportedAt: new Date().toISOString(),
      categories,
      transactions,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ingatmiskin-backup-${new Date().toISOString().split("T")[0]}.json`;
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
        if (
          (data.application !== "IngatMiskin" &&
            data.application !== "MoneyTrack" &&
            data.application !== "Ingat Miskin") ||
          !data.schemaVersion
        ) {
          setImportStatus("File bukan backup yang valid");
          return;
        }
        await db.transactions.clear();
        await db.categories.clear();
        await db.settings.clear();
        if (data.categories?.length)
          await db.categories.bulkPut(data.categories);
        if (data.transactions?.length)
          await db.transactions.bulkPut(data.transactions);
        if (data.settings) await db.settings.put(data.settings);
        await Promise.all([
          loadTransactions(),
          loadCategories(),
          loadSettings(),
        ]);
        setImportStatus("✓ Data berhasil diimpor");
      } catch {
        setImportStatus("Gagal mengimpor data. File tidak valid.");
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Amount",
      "Category",
      "Note",
      "Payment Method",
      "Created At",
    ];
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

  const handleClearData = async () => {
    await db.transactions.clear();
    await db.categories.clear();
    await db.settings.clear();
    await initializeDatabase();
    await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
    setShowClearConfirm(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-[#0F172A]">
        Pengaturan
      </h1>

      {/* Akses Cepat / Install PWA */}
      <SectionTitle>Aplikasi</SectionTitle>
      <div className="pastel-card mb-5 overflow-hidden">
        <button
          onClick={handleInstallClick}
          className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
          id="btn-install-a2hs"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-[#0F172A]">
              Akses di Layar Utama
            </div>
            <div className="text-xs font-medium text-slate-400">
              {isStandalone
                ? "✓ Sudah terpasang di HP Anda"
                : "Pasang icon di home screen untuk akses cepat"}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* Account */}
      <SectionTitle>Akun</SectionTitle>
      <div className="pastel-card mb-5 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold text-[#0F172A]">
              {session?.user?.name ?? "Pengguna"}
            </div>
            <div className="truncate text-xs font-medium text-slate-400">
              {session?.user?.email}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-5 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Keluar dari Akun
          </button>
        </div>
      </div>

      {/* Preferences */}
      <SectionTitle>Preferensi</SectionTitle>
      <div className="mb-5 space-y-3">
        {/* Payment Method */}
        <div className="pastel-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            <CreditCard className="h-4 w-4 text-violet-600" />
            Metode Pembayaran Default
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setDefaultPaymentMethod(value)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                  settings.defaultPaymentMethod === value
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
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
      <div className="pastel-card mb-5 overflow-hidden divide-y divide-slate-100">
        <SettingsRow
          icon={isSyncing ? RefreshCw : Cloud}
          label={isSyncing ? "Menyinkronkan..." : "Sync"}
          onClick={handleManualSync}
        />
        <SettingsRow
          icon={Download}
          label="Ekspor JSON"
          onClick={handleExportJSON}
        />
        <SettingsRow
          icon={Upload}
          label="Impor JSON"
          onClick={handleImportJSON}
        />
        <SettingsRow
          icon={FileSpreadsheet}
          label="Ekspor CSV"
          onClick={handleExportCSV}
        />
        <SettingsRow
          icon={Trash2}
          label="Hapus semua data"
          onClick={() => setShowClearConfirm(true)}
          destructive
        />
      </div>

      {importStatus && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-xs">
          <span className="text-sm font-semibold text-emerald-800">
            {importStatus}
          </span>
          <button
            onClick={() => setImportStatus(null)}
            className="text-xs font-bold text-emerald-600 underline"
          >
            Tutup
          </button>
        </div>
      )}

      <p className="text-center text-xs font-medium text-slate-400">
        Data tersimpan secara lokal & tersinkron aman ke cloud.
      </p>

      {/* Clear Data Bottom Sheet Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50">
          <div
            className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowClearConfirm(false)}
          />
          <div
            className="animate-slide-up absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}
          >
            {/* Handle bar */}
            <div className="flex justify-center -mt-2 pb-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Hapus semua data?
              </h3>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-6 text-sm font-medium text-slate-500">
              Semua transaksi dan riwayat pengeluaran lokal akan dihapus secara
              permanen. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-extrabold text-white shadow-md shadow-rose-500/25 hover:bg-rose-600 active:scale-[0.98] transition-all cursor-pointer"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <PwaInstallModal />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </h2>
  );
}

function SettingsRow({
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
      className={cn(
        "flex w-full items-center gap-3.5 px-5 py-3.5 text-sm font-bold transition-colors hover:bg-slate-50 cursor-pointer",
        destructive ? "text-rose-500" : "text-[#0F172A]",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl",
          destructive
            ? "bg-rose-50 text-rose-500"
            : "bg-slate-100 text-slate-600",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}
