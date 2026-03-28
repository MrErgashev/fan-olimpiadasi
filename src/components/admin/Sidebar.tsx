"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Badge } from "@/components/ui/Badge";
import {
  LayoutDashboard,
  FileQuestion,
  ClipboardList,
  Users,
  Trophy,
  KeyRound,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "ASOSIY",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "KONTENT",
    items: [
      { href: "/admin/questions", label: "Savollar", icon: FileQuestion },
      { href: "/admin/tests", label: "Testlar", icon: ClipboardList },
    ],
  },
  {
    label: "FOYDALANUVCHILAR",
    items: [
      { href: "/admin/students", label: "O'quvchilar", icon: Users },
      { href: "/admin/access-codes", label: "Access kodlar", icon: KeyRound },
    ],
  },
  {
    label: "TAHLIL",
    items: [
      { href: "/admin/results", label: "Natijalar", icon: Trophy },
      { href: "/admin/security-logs", label: "Xavfsizlik", icon: ShieldAlert },
    ],
  },
  {
    label: "SOZLAMALAR",
    items: [
      { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <>
      {/* Logo area */}
      <div className="p-5 pb-4">
        <Logo size="sm" />
        <div className="gradient-divider-blue mt-4" />
      </div>

      {/* Admin badge */}
      <div className="px-5 mb-3">
        <Badge variant="info" size="sm">
          ADMIN
        </Badge>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative",
                      isActive
                        ? "bg-primary-500/15 text-primary-400 font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                    )}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-primary-500 to-accent-cyan" />
                    )}
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-app-dark/90 backdrop-blur-lg border border-white/10 text-white shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-app-dark/95 backdrop-blur-2xl border-r border-white/10 flex flex-col z-40 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
