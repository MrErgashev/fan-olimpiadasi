import { Logo } from "./Logo";
import { CONTACT_INFO } from "@/lib/constants";
import { Send, ExternalLink, Heart, Globe } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-green-900 border-t border-white/5">
      <div className="max-w-container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Info */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-white/50 max-w-xs">
              Oriental Universiteti tomonidan tashkil etiladigan respublika
              miqyosidagi Fan Olimpiadasi
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Havolalar
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/results"
                className="text-sm text-white/60 hover:text-gold-400 transition-colors"
              >
                Natijalar
              </Link>
              <Link
                href="/login"
                className="text-sm text-white/60 hover:text-gold-400 transition-colors"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="text-sm text-white/60 hover:text-gold-400 transition-colors"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Bog&apos;lanish
            </h4>
            <p className="text-sm text-white/60">{CONTACT_INFO.address}</p>
            <div className="flex gap-3">
              <a
                href="https://t.me/Dilya0103"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-gold-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-gold-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-gold-400 transition-colors"
              >
                <Heart className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-gold-400 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-white/30">
            &copy; {CONTACT_INFO.year} {CONTACT_INFO.university}. Barcha
            huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
