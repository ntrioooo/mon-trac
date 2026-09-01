"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSettingsStore } from "@/stores/settings-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useWalletStore } from "@/stores/wallet-store";
import { usePwaStore } from "@/stores/pwa-store";
import { db, initializeDatabase } from "@/lib/db";

import {
  LogOut,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  ChevronRight,
  User,
  Cloud,
  RefreshCw,
  Smartphone,
  Database,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { syncEngine } from "@/lib/sync-engine";
import { PwaInstallModal } from "@/components/ui/pwa-install-modal";

export default function SettingsPage() {
  const { data: session } = useSession();

  const settings = useSettingsStore((s) => s.settings);

  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadWallets = useWalletStore((s) => s.loadWallets);
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
      await Promise.all([loadTransactions(), loadWallets(), loadCategories(), loadSettings()]);
      setImportStatus(
        `✓ Berhasil disinkronkan (${result.count} data transaksi & dompet diproses)`,
      );
    } else {
      setImportStatus(
        `Gagal sinkronisasi: ${result.error || "Cek koneksi internet"}`,
      );
    }
  };

  const handleExportJSON = () => {
    const data = {
      schemaVersion: 2,
      application: "JagaJajan" as const,
      exportedAt: new Date().toISOString(),
      wallets,
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
    a.download = `jagajajan-backup-${new Date().toISOString().split("T")[0]}.json`;
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
          data.application !== "JagaJajan" &&
          data.application !== "MonTrac" &&
          data.application !== "MoneyTrack" &&
          data.application !== "IngatMiskin" &&
          data.application !== "Ingat Miskin"
        ) {
          setImportStatus("File bukan backup yang valid");
          return;
        }
        await db.transactions.clear();
        await db.categories.clear();
        await db.settings.clear();
        await db.wallets.clear();

        if (data.wallets?.length) await db.wallets.bulkPut(data.wallets);
        if (data.categories?.length) await db.categories.bulkPut(data.categories);
        if (data.transactions?.length) await db.transactions.bulkPut(data.transactions);
        if (data.settings) await db.settings.put(data.settings);

        await initializeDatabase();
        await Promise.all([
          loadTransactions(),
          loadWallets(),
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
      "Type",
      "Amount",
      "Category",
      "Wallet",
      "Note",
      "Created At",
    ];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const wallet = wallets.find((w) => w.id === t.walletId);
      return [
        t.date,
        t.type || "expense",
        t.amount.toString(),
        cat?.name ?? "Unknown",
        wallet?.name ?? "Dompet Tunai",
        t.note ?? "",
        t.createdAt,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `montrac-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    await db.transactions.clear();
    await db.categories.clear();
    await db.settings.clear();
    await db.wallets.clear();
    await initializeDatabase();
    await Promise.all([loadTransactions(), loadWallets(), loadCategories(), loadSettings()]);
    setShowClearConfirm(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0F172A]">Akun</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Kelola data dan preferensi</p>
      </div>

      {/* Profile Card */}
      <div
        className="fun-card mb-5 p-4 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(196,181,253,0.15) 0%, rgba(196,181,253,0.08) 100%)" }}
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-violet-700"
          style={{ backgroundColor: "rgba(196,181,253,0.25)" }}
        >
          {(session?.user?.name?.[0] ?? "U").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-extrabold text-[#0F172A]">
            {session?.user?.name ?? "Pengguna"}
          </div>
          <div className="truncate text-xs font-semibold text-slate-400 mt-0.5">
            {session?.user?.email}
          </div>
        </div>
      </div>

      {/* ── Aplikasi ── */}
      <SectionTitle icon={Smartphone}>Aplikasi</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <button
          onClick={handleInstallClick}
          className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-violet-50 cursor-pointer"
          id="btn-install-a2hs"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(196,181,253,0.25)" }}
          >
            <Smartphone className="h-5 w-5 text-violet-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-[#0F172A]">Akses di Layar Utama</div>
            <div className="text-xs font-semibold text-slate-400">
              {isStandalone ? "✓ Sudah terpasang di HP Anda" : "Pasang icon di home screen"}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* ── Akun ── */}
      <SectionTitle icon={User}>Akun</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-rose-50 cursor-pointer"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
          >
            <LogOut className="h-5 w-5 text-rose-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-rose-500">Keluar dari Akun</div>
            <div className="text-xs font-semibold text-slate-400">Kamu akan diarahkan ke halaman login</div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* ── Data & Backup ── */}
      <SectionTitle icon={Database}>Data &amp; Backup</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <SettingsRow
          icon={isSyncing ? RefreshCw : Cloud}
          label={isSyncing ? "Menyinkronkan..." : "Sinkronisasi Cloud"}
          sublabel="Sync data ke server"
          onClick={handleManualSync}
        />
        <SettingsRow
          icon={Download}
          label="Ekspor JSON"
          sublabel="Simpan data sebagai file backup"
          onClick={handleExportJSON}
        />
        <SettingsRow
          icon={Upload}
          label="Impor JSON"
          sublabel="Pulihkan dari file backup"
          onClick={handleImportJSON}
        />
        <SettingsRow
          icon={FileSpreadsheet}
          label="Ekspor CSV"
          sublabel="Buka di Excel atau Google Sheets"
          onClick={handleExportCSV}
        />
        <SettingsRow
          icon={Trash2}
          label="Hapus semua data"
          sublabel="Hapus semua transaksi lokal"
          onClick={() => setShowClearConfirm(true)}
          destructive
        />
      </div>

      {importStatus && (
        <div
          className="mb-5 flex items-center justify-between rounded-[var(--radius)] border-2 px-4 py-3"
          style={{ borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" }}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700">
              {importStatus}
            </span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-xs font-bold underline text-emerald-600"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Enkripsi & Privasi Info ── */}
      <div
        className="mb-5 rounded-[var(--radius)] p-4 flex gap-3"
        style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
      >
        <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
        <div>
          <p className="text-sm font-extrabold text-emerald-700 mb-0.5">
            Data kamu terenkripsi &amp; aman
          </p>
          <p className="text-xs font-semibold text-emerald-600">
            Semua data keuangan disimpan secara lokal di perangkat. Saat sinkronisasi ke cloud, data dienkripsi end-to-end sehingga hanya kamu yang bisa membacanya. Kami tidak pernah bisa melihat isi data kamu.
          </p>
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-slate-400 mb-5">
        JagaJajan v1.0 · Made with ❤️
      </p>

      {/* Clear Data Bottom Sheet */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50">
          <div
            className="animate-fade-in absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          <div
            className="animate-slide-up absolute bottom-0 left-0 right-0 bg-white shadow-2xl"
            style={{
              borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
              paddingBottom: "env(safe-area-inset-bottom, 1.5rem)",
            }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-12 rounded-full bg-slate-200" />
            </div>
            <div className="px-6 pb-6">
              <div className="text-center mb-5">
                <Trash2 className="mx-auto h-10 w-10 mb-3 text-rose-500" />
                <h3 className="text-base font-extrabold text-[#0F172A]">Hapus semua data?</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Semua transaksi lokal akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-[var(--radius)] border-2 border-slate-200 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 rounded-[var(--radius)] py-3.5 text-sm font-extrabold text-white cursor-pointer bg-rose-500"
                  style={{ boxShadow: "0 4px 14px rgba(239,68,68,0.4)" }}
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PwaInstallModal />
    </div>
  );
}

function SectionTitle({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <h2 className="mb-2.5 px-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100">
        <Icon className="h-3 w-3 text-violet-600" />
      </div>
      {children}
    </h2>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 px-5 py-3.5 text-sm transition-colors hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
          destructive ? "bg-rose-50" : "bg-violet-50"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            destructive ? "text-rose-500" : "text-violet-600"
          )}
        />
      </div>
      <div className="flex-1 text-left">
        <div className={cn("text-sm font-bold", destructive ? "text-rose-500" : "text-[#0F172A]")}>
          {label}
        </div>
        {sublabel && (
          <div className="text-xs font-semibold text-slate-400 mt-0.5">{sublabel}</div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}
