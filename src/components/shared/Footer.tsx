"use client";

import { Logo } from "./Logo";
import { CONTACT_INFO, SUBJECTS } from "@/lib/constants";
import {
  SendIcon, PinIcon, PhoneIcon,
  CalculatorIcon, MonitorIcon, BookIcon, GlobeIcon, DnaIcon, BooksIcon, RunningIcon,
} from "@/components/ui/Icon3D";
import Link from "next/link";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator: CalculatorIcon, Monitor: MonitorIcon, BookOpen: BookIcon,
  Globe: GlobeIcon, Dna: DnaIcon, BookText: BooksIcon, Dumbbell: RunningIcon,
};

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white relative">
      {/* Gold gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="max-w-container mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo size="md" variant="dark" />
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Oriental Universiteti tomonidan tashkil etiladigan respublika
              miqyosidagi Fan Olimpiadasi
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://t.me/Dilya0103"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-gold-500/10 text-white/50 hover:text-gold-400 transition-all duration-300 hover:shadow-glow-gold"
              >
                <SendIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Havolalar
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/results", label: "Natijalar" },
                { href: "/login", label: "Kirish" },
                { href: "/register", label: "Ro'yxatdan o'tish" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/50 hover:text-gold-400 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Fanlar
            </h4>
            <div className="flex flex-col gap-2.5">
              {SUBJECTS.map((subject) => {
                const Icon = ICON_MAP[subject.icon];
                return (
                  <a
                    key={subject.slug}
                    href="#fanlar"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-gold-400 transition-all duration-200 group hover:translate-x-1 transform"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-gold-400/40 group-hover:text-gold-400 transition-colors duration-200" />}
                    {subject.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Bog&apos;lanish
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <PinIcon className="w-4 h-4 text-gold-400/60 mt-0.5 shrink-0" />
                <p className="text-sm text-white/50">{CONTACT_INFO.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-gold-400/60 shrink-0" />
                <p className="text-sm text-white/50">Telegram orqali</p>
              </div>
              {CONTACT_INFO.telegram.map((tg) => (
                <a
                  key={tg}
                  href={`https://t.me/${tg.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-gold-400 transition-all duration-200 ml-7 group"
                >
                  <SendIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  {tg}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
          <p className="text-sm text-white/30">
            &copy; {CONTACT_INFO.year} {CONTACT_INFO.university}. Barcha
            huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
