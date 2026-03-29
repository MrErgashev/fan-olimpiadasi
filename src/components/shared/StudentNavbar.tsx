"use client";

import { Logo } from "./Logo";
import NotificationBell from "./NotificationBell";
import { Button } from "@/components/ui/Button";
import { LogoutIcon } from "@/components/ui/Icon3D";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface StudentNavbarProps {
  firstName: string;
  lastName: string;
}

export function StudentNavbar({ firstName, lastName }: StudentNavbarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl shadow-sm">
      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/dashboard">
            <Logo size="sm" variant="light" />
          </Link>

          <div className="flex items-center gap-4">
            <NotificationBell />
            {/* Avatar with initials — profile link */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-blue">
                <span className="text-sm font-bold text-white">
                  {initials}
                </span>
              </div>
              <span className="hidden sm:block text-sm text-slate-600 font-medium">
                {firstName} {lastName}
              </span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <LogoutIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
