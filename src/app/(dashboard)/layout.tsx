"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ExpenseSheet } from "@/components/expense/expense-sheet";
import { createClient } from "@/lib/supabase/client";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Toast, useToast } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        await Promise.all([
          loadTransactions(),
          loadCategories(),
          loadSettings(),
        ]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsReady(true);
      }
    }

    init();

    // Listen to auth state changes (e.g. sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadTransactions, loadCategories, loadSettings, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-emerald)] border-t-transparent" />
          <p className="text-sm text-[var(--color-slate)]">Memuat data...</p>
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
