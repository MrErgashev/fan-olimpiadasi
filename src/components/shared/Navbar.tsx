"use client";

import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#fanlar", label: "Fanlar" },
  { href: "#sovgalar", label: "Sovg'alar" },
  { href: "#jadval", label: "Jadval" },
  { href: "#faq", label: "Savol-javob" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section tracking
      const sections = NAV_LINKS.map(link => link.href.replace("#", ""));
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-navy-950/95 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-gold-500/10"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/">
              <Logo size="sm" variant="dark" />
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative text-[15px] font-medium tracking-wide transition-colors duration-200",
                      isActive
                        ? "text-gold-400"
                        : "text-white/70 hover:text-gold-400"
                    )}
                  >
                    {link.label}
                    {/* Active underline */}
                    <span className={cn(
                      "absolute left-0 -bottom-1 h-[2px] bg-gold-400 transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                    {/* Hover underline */}
                    {!isActive && (
                      <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gold-400/50 hover:w-full transition-all duration-300" />
                    )}
                  </a>
                );
              })}
              <div className="flex items-center gap-3 ml-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    Kirish
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Ro&apos;yxatdan o&apos;tish
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden relative z-50 p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute left-0 h-[2px] w-6 bg-current transition-all duration-300",
                    isOpen ? "top-[11px] rotate-45" : "top-[4px] rotate-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[11px] h-[2px] w-6 bg-current transition-all duration-300",
                    isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-[2px] w-6 bg-current transition-all duration-300",
                    isOpen ? "top-[11px] -rotate-45" : "top-[18px] rotate-0"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-navy-950/98 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            {/* Decorative glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-gold-500/[0.04] blur-[100px]" />

            <div className="flex flex-col items-center gap-6 relative">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="text-2xl text-white/80 hover:text-gold-400 transition-colors duration-200 font-semibold tracking-wide"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex flex-col gap-3 mt-8 w-64"
              >
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" size="lg">
                    Kirish
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full" size="lg">
                    Ro&apos;yxatdan o&apos;tish
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
