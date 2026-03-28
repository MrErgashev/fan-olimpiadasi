"use client";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface StudentNavbarProps {
  firstName: string;
  lastName: string;
}

export function StudentNavbar({ firstName, lastName }: StudentNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-green-900/90 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-white/70">
              <User className="w-4 h-4" />
              <span>
                {firstName} {lastName}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-white/50 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
