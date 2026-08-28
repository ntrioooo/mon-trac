"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ExpenseSheet } from "@/components/expense/expense-sheet";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Toast, useToast } from "@/components/ui/toast";
import { initializeDatabase } from "@/lib/db";
import { syncEngine } from "@/lib/sync-engine";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const userIdentifier = session?.user?.email || session?.user?.id;

      async function init() {
        try {
          await initializeDatabase();
          await Promise.all([loadTransactions(), loadCategories(), loadSettings()]);
          
          // Background Auto-Sync to/from Supabase
          if (navigator.onLine) {
            syncEngine.syncAll(userIdentifier).then(() => {
              loadTransactions();
            });
          }
        } catch (error) {
          console.error("Failed to load initial data:", error);
        } finally {
          setIsReady(true);
        }
      }
      init();

      // Listen for reconnect event
      const handleOnline = () => {
        console.log("[App] Network online. Triggering auto-sync...");
        syncEngine.syncAll(userIdentifier).then(() => {
          loadTransactions();
        });
      };

      window.addEventListener("online", handleOnline);
      return () => {
        window.removeEventListener("online", handleOnline);
      };
    }
  }, [status, session, loadTransactions, loadCategories, loadSettings, router]);

  if (status === "loading" || !isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-aurora-header">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-3 border-violet-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Memuat Ingat Miskin...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="safe-bottom min-h-dvh pb-4">{children}</main>
      <BottomNavigation onAddExpense={() => setExpenseOpen(true)} />
      <ExpenseSheet
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        onSuccess={() => {
          showToast("Pengeluaran tersimpan ✓", "success");
        }}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}
