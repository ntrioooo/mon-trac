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
  { href: "/transactions", label: "Aktivitas", icon: Receipt },
  { href: "/reports", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Account", icon: Settings },
];

export function BottomNavigation({ onAddExpense }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pastel-nav-bar"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative mx-auto flex h-[var(--nav-height)] max-w-lg items-center justify-around px-2">
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

        {/* Center Floating FAB (Violet) */}
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={onAddExpense}
            className="relative z-10 -mt-6 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-violet-600 text-white shadow-xl shadow-violet-500/35 transition-all hover:bg-violet-700 hover:scale-105 active:scale-95"
            aria-label="Tambah pengeluaran"
            id="add-expense-fab"
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Reports / Analytics */}
        <NavItem
          href={navItems[2].href}
          label={navItems[2].label}
          icon={navItems[2].icon}
          isActive={pathname === navItems[2].href}
        />

        {/* Settings / Account */}
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
        "flex min-w-[3.25rem] flex-col items-center gap-1 px-2 py-1 text-[10px] font-semibold transition-colors",
        isActive ? "text-[#7C3AED]" : "text-slate-400 hover:text-slate-600"
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        isActive && "bg-violet-50 text-[#7C3AED]"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span>{label}</span>
    </Link>
  );
}
