"use client";

import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { motion } from "framer-motion";
import { BookOpen, Users, Trophy } from "lucide-react";
import Link from "next/link";

const TRUST_BULLETS = [
  { icon: BookOpen, text: "7 ta fan bo'yicha" },
  { icon: Users, text: "1000+ ishtirokchi" },
  { icon: Trophy, text: "Qimmatbaho sovg'alar" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-navy-700/30 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-navy-600/20 blur-[120px]" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-gold-500/[0.06] blur-[120px]" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 text-center pt-28 pb-24">
        {/* Pre-title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm sm:text-base tracking-[0.25em] uppercase text-gold-400/70 mb-6 font-medium"
        >
          Oriental Universiteti taqdim etadi
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black tracking-tight leading-[0.9]"
        >
          <span className="text-white">FAN</span>{" "}
          <span className="text-gradient-gold">OLIMPIADASI</span>
        </motion.h1>

        {/* Year badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-6 mb-8"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-white/[0.06] border border-white/10 text-gold-400 font-mono font-bold text-sm tracking-widest">
            30-31 MART 2026
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          11-sinf o&apos;quvchilari orasida respublika miqyosidagi bilim bellashuvi.
          O&apos;zingizni sinab ko&apos;ring va kelajagingizni yarating.
        </motion.p>

        {/* Trust bullets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-10"
        >
          {TRUST_BULLETS.map((bullet) => (
            <div key={bullet.text} className="flex items-center gap-2 text-white/40">
              <bullet.icon className="w-4 h-4 text-gold-500/60" />
              <span className="text-sm font-medium">{bullet.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 sm:mb-16"
        >
          <Link href="/register">
            <Button variant="premium" size="xl">
              HOZIROQ RO&apos;YXATDAN O&apos;TING
            </Button>
          </Link>
          <a href="#fanlar">
            <Button variant="outline" size="lg">
              Batafsil ma&apos;lumot
            </Button>
          </a>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-5 font-medium">
            Olimpiada boshlanishiga · Toshkent vaqti
          </p>
          <CountdownTimer />
        </motion.div>
      </div>

      {/* Bottom gradient fade to light */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>
  );
}
