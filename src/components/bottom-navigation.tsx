"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Receipt, BarChart3, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onAddExpense: () => void;
}

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/transactions", label: "Aktivitas", icon: Receipt },
  { href: "/reports", label: "Analitik", icon: BarChart3 },
  { href: "/settings", label: "Akun", icon: Settings },
];

export function BottomNavigation({ onAddExpense }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 fun-nav-bar"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative mx-auto flex h-[var(--nav-height)] max-w-lg items-center justify-around px-2">
        <NavItem {...navItems[0]} isActive={pathname === navItems[0].href} />
        <NavItem {...navItems[1]} isActive={pathname === navItems[1].href} />

        {/* Center Navy FAB */}
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={onAddExpense}
            className="relative z-10 -mt-6 flex h-14 w-14 cursor-pointer items-center justify-center fun-fab"
            aria-label="Tambah transaksi"
            id="add-expense-fab"
          >
            <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
          </button>
        </div>

        <NavItem {...navItems[2]} isActive={pathname === navItems[2].href} />
        <NavItem {...navItems[3]} isActive={pathname === navItems[3].href} />
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[3.25rem] flex-col items-center gap-0.5 py-1 text-[10px] tracking-tight transition-all"
    >
      {/* Violet pill for active state */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full px-3.5 py-1.5 transition-all",
          isActive ? "" : ""
        )}
      >
        <Icon
          className={cn(
            "h-[20px] w-[20px] transition-colors",
            isActive ? "text-[#7C3AED]" : "text-[#94A3B8]"
          )}
          strokeWidth={isActive ? 2.5 : 1.75}
        />
      </div>
      <span
        className="font-bold"
        style={{ color: isActive ? "#7C3AED" : "#94A3B8" }}
      >
        {label}
      </span>
    </Link>
  );
}
