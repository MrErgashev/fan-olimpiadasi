"use client";

import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { ParticleBackground } from "./ParticleBackground";
import { SpotlightEffect } from "./SpotlightEffect";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export function Hero() {
  const { isMobile, prefersReducedMotion } = useDeviceCapability();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const skipAnimations = isMobile || prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950"
    >
      {/* Particle canvas */}
      <ParticleBackground disabled={skipAnimations} />

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-navy-700/30 blur-[150px]"
          animate={
            skipAnimations
              ? undefined
              : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-navy-600/20 blur-[120px]"
          animate={
            skipAnimations
              ? undefined
              : { x: [0, -30, 15, 0], y: [0, 25, -15, 0] }
          }
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-gold-500/[0.06] blur-[120px]"
          animate={
            skipAnimations
              ? undefined
              : {
                  scale: [1, 1.15, 0.95, 1],
                  opacity: [0.06, 0.09, 0.05, 0.06],
                }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
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

      {/* Mouse spotlight (desktop only) */}
      <SpotlightEffect containerRef={sectionRef} disabled={skipAnimations} />

      {/* Floating decorative elements (desktop only) */}
      {!skipAnimations && (
        <>
          {/* Top-left diamond */}
          <motion.div
            className="absolute w-3 h-3 border border-gold-500/20 rotate-45 hidden md:block"
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "18%", left: "12%" }}
          />
          {/* Top-right ring */}
          <motion.div
            className="absolute w-5 h-5 rounded-full border border-gold-400/15 hidden md:block"
            animate={{ y: [0, 12, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{ top: "25%", right: "15%" }}
          />
          {/* Bottom-left small dot */}
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-gold-500/20 hidden md:block"
            animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            style={{ bottom: "30%", left: "8%" }}
          />
          {/* Bottom-right diamond */}
          <motion.div
            className="absolute w-2.5 h-2.5 border border-white/10 rotate-45 hidden md:block"
            animate={{ y: [0, 10, 0], opacity: [0.1, 0.25, 0.1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            style={{ bottom: "35%", right: "10%" }}
          />

          {/* Corner accents */}
          <div
            className="absolute hidden lg:block border-t border-l border-gold-500/10 w-10 h-10"
            style={{ top: "10%", left: "5%" }}
          />
          <div
            className="absolute hidden lg:block border-b border-r border-gold-500/10 w-10 h-10"
            style={{ bottom: "15%", right: "5%" }}
          />
        </>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-container mx-auto px-4 sm:px-6 text-center pt-28 pb-24"
        style={
          !skipAnimations ? { y: titleY, opacity: contentOpacity } : undefined
        }
      >
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
          <span className="text-white text-glow-white">FAN</span>{" "}
          <span className="text-gradient-gold-shimmer">OLIMPIADASI</span>
        </motion.h1>

        {/* Ornamental line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 mb-5 flex justify-center"
        >
          <div className="ornamental-line w-24" />
        </motion.div>

        {/* Year badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-8"
        >
          <span className="badge-shimmer inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.06] border border-white/10 text-gold-400 font-mono font-bold text-sm tracking-widest">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="text-gold-500/60"
            >
              <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" fill="currentColor" />
            </svg>
            30-31 MART 2026
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="text-gold-500/60"
            >
              <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" fill="currentColor" />
            </svg>
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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-10"
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
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-5 font-medium">
            Olimpiada boshlanishiga · Toshkent vaqti
          </p>
          <CountdownTimer />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-navy-900/80 to-transparent" />
    </section>
  );
}
