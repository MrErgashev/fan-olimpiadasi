import { Logo } from "./Logo";
import { CONTACT_INFO, SUBJECTS } from "@/lib/constants";
import { Send, ExternalLink, Heart, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-green-900">
      {/* CTA Section */}
      <div className="max-w-container mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gold-gradient mb-4">
          Olimpiadaga tayyormisiz?
        </h3>
        <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
          Hoziroq ro&apos;yxatdan o&apos;ting va o&apos;z bilimingizni sinab
          ko&apos;ring
        </p>
        <Link href="/register">
          <Button variant="premium" size="xl">
            Ro&apos;yxatdan o&apos;tish
          </Button>
        </Link>
      </div>

      {/* Gold gradient separator */}
      <div className="gradient-divider" />

      {/* Footer content */}
      <div className="max-w-container mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo size="md" />
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Oriental Universiteti tomonidan tashkil etiladigan respublika
              miqyosidagi Fan Olimpiadasi
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://t.me/Dilya0103"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-gold-500/10 text-white/60 hover:text-gold-400 transition-all duration-300 hover:scale-110"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-gold-500/10 text-white/60 hover:text-gold-400 transition-all duration-300 hover:scale-110"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-gold-500/10 text-white/60 hover:text-gold-400 transition-all duration-300 hover:scale-110"
              >
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Havolalar
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/results"
                className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
              >
                Natijalar
              </Link>
              <Link
                href="/login"
                className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Fanlar
            </h4>
            <div className="flex flex-col gap-2.5">
              {SUBJECTS.map((subject) => (
                <a
                  key={subject.slug}
                  href="#fanlar"
                  className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
                >
                  {subject.emoji} {subject.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              Bog&apos;lanish
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <p className="text-sm text-white/60">{CONTACT_INFO.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <p className="text-sm text-white/60">Telegram orqali</p>
              </div>
              {CONTACT_INFO.telegram.map((tg) => (
                <a
                  key={tg}
                  href={`https://t.me/${tg.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-gold-400 transition-colors duration-300 ml-7"
                >
                  <Send className="w-3 h-3" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">
              &copy; {CONTACT_INFO.year} {CONTACT_INFO.university}. Barcha
              huquqlar himoyalangan.
            </p>
            <p className="text-sm text-white/20 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400/60" /> by
              Oriental
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
