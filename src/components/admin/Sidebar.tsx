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
      <div className="px-5 pt-6 pb-4">
        <Logo size="sm" variant="light" />
      </div>

      {/* Admin badge + notifications */}
      <div className="px-5 mb-5 flex items-center justify-between">
        <Badge variant="info" size="sm">
          ADMIN
        </Badge>
        <NotificationBell />
      </div>

      {/* Divider */}
      <div className="mx-4 border-b border-slate-200/80 mb-4" />

      {/* Nav groups */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold select-none">
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
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 relative",
                      isActive
                        ? "bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-500 ml-0 pl-[10px]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-200/80 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 w-full"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm active:scale-95 transition-transform"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-out",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
