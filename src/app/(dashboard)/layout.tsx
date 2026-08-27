"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ExpenseSheet } from "@/components/expense/expense-sheet";
import { initializeDatabase } from "@/lib/db";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Toast, useToast } from "@/components/ui/toast";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        await Promise.all([
          loadTransactions(),
          loadCategories(),
          loadSettings(),
        ]);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, [loadTransactions, loadCategories, loadSettings]);

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-emerald)] border-t-transparent" />
          <p className="text-sm text-[var(--color-slate)]">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="safe-bottom min-h-dvh pb-4">
        {children}
      </main>
      <BottomNavigation onAddExpense={() => setExpenseOpen(true)} />
      <ExpenseSheet
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        onSuccess={() => {
          showToast("Pengeluaran tersimpan", "success");
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
