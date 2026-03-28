"use client";

import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { ParticleBackground } from "./ParticleBackground";
import { Logo } from "@/components/shared/Logo";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Multi-layer gradient mesh background */}
      <div className="absolute inset-0 bg-green-900" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-green-700/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[100px]" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-[100px]" />
      </div>

      {/* Animated gradient blobs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-green-600/10 blur-[150px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gold-500/[0.04] blur-[120px]"
      />

      <ParticleBackground />

      {/* Subtle geometric pattern — left side */}
      <div className="absolute left-0 top-0 bottom-0 w-64 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(212,168,67,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      {/* Right side */}
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(212,168,67,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 text-center pt-24 pb-20">
        {/* Pre-title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm sm:text-base tracking-[0.3em] uppercase text-gold-400/60 mb-8"
        >
          Oriental Universiteti taqdim etadi
        </motion.p>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <Logo size="xl" />
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight"
        >
          <span className="text-gold-gradient">FAN</span>{" "}
          <span className="text-gold-gradient">OLIMPIADASI</span>
        </motion.h1>

        {/* Ornamental line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="ornamental-line mt-8 mb-6"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-white/50 max-w-xl mx-auto leading-relaxed"
        >
          11-sinf o&apos;quvchilari orasida respublika miqyosidagi onlayn
          olimpiada
        </motion.p>

        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-gold glow-gold">
            <span className="text-gold-400 font-mono font-bold text-sm sm:text-base tracking-wider">
              30-31 MART 2026
            </span>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-16"
        >
          <CountdownTimer />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register">
            <Button variant="premium" size="xl">
              RO&apos;YXATDAN O&apos;TISH
            </Button>
          </Link>
          <a href="#fanlar">
            <Button variant="outline" size="lg">
              Batafsil &rarr;
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — gradient fade + chevron */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-32 bg-gradient-to-t from-green-900 to-transparent" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-gold-400/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
