"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import NotificationBell from "@/components/shared/NotificationBell";
import { Badge } from "@/components/ui/Badge";
import { Menu, X } from "lucide-react";
import {
  DashboardIcon, QuestionIcon, ClipboardIcon, UsersIcon,
  TrophyIcon, KeyIcon, ShieldIcon, GearIcon, LogoutIcon,
} from "@/components/ui/Icon3D";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "ASOSIY",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
    ],
  },
  {
    label: "KONTENT",
    items: [
      { href: "/admin/questions", label: "Savollar", icon: QuestionIcon },
      { href: "/admin/tests", label: "Testlar", icon: ClipboardIcon },
    ],
  },
  {
    label: "FOYDALANUVCHILAR",
    items: [
      { href: "/admin/students", label: "O'quvchilar", icon: UsersIcon },
      { href: "/admin/access-codes", label: "Access kodlar", icon: KeyIcon },
    ],
  },
  {
    label: "TAHLIL",
    items: [
      { href: "/admin/results", label: "Natijalar", icon: TrophyIcon },
      { href: "/admin/security-logs", label: "Xavfsizlik", icon: ShieldIcon },
    ],
  },
  {
    label: "SOZLAMALAR",
    items: [
      { href: "/admin/notifications", label: "Bildirishnomalar", icon: Bell },
      { href: "/admin/settings", label: "Sozlamalar", icon: GearIcon },
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
        <Logo size="sm" variant="light" />
        <div className="mt-4 border-b border-slate-200" />
      </div>

      {/* Admin badge + notifications */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <Badge variant="info" size="sm">
          ADMIN
        </Badge>
        <NotificationBell />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
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
                        ? "bg-primary-50 text-primary-600 font-medium"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogoutIcon className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 shadow-sm flex flex-col z-40 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
