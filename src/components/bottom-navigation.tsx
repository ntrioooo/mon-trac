"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Receipt, BarChart3, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onAddExpense: () => void;
}

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: Receipt },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function BottomNavigation({ onAddExpense }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-white/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex h-[var(--nav-height)] max-w-lg items-center justify-around px-2">
        {/* Home */}
        <NavItem
          href={navItems[0].href}
          label={navItems[0].label}
          icon={navItems[0].icon}
          isActive={pathname === navItems[0].href}
        />

        {/* Transactions */}
        <NavItem
          href={navItems[1].href}
          label={navItems[1].label}
          icon={navItems[1].icon}
          isActive={pathname === navItems[1].href}
        />

        {/* FAB — Center + button */}
        <div className="flex flex-col items-center">
          <button
            onClick={onAddExpense}
            className="fab-shadow -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-emerald)] text-white transition-transform active:scale-95"
            aria-label="Tambah pengeluaran"
            id="add-expense-fab"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        {/* Reports */}
        <NavItem
          href={navItems[2].href}
          label={navItems[2].label}
          icon={navItems[2].icon}
          isActive={pathname === navItems[2].href}
        />

        {/* Settings */}
        <NavItem
          href={navItems[3].href}
          label={navItems[3].label}
          icon={navItems[3].icon}
          isActive={pathname === navItems[3].href}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-[3rem] flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
        isActive
          ? "text-[var(--color-emerald)] font-medium"
          : "text-[var(--color-muted)]"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
