"use client";

import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { ParticleBackground } from "./ParticleBackground";
import { SpotlightEffect } from "./SpotlightEffect";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const { isMobile, prefersReducedMotion } = useDeviceCapability();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 600], [0, -80]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.1]);

  const skipAnimations = isMobile || prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950"
    >
      {/* Particle canvas */}
      <ParticleBackground disabled={skipAnimations} />

      {/* Animated gradient mesh background with parallax */}
      <motion.div className="absolute inset-0" style={!skipAnimations ? { scale: bgScale } : undefined}>
        <motion.div
          className="absolute top-[-10%] left-[15%] w-[900px] h-[900px] rounded-full bg-navy-700/30 blur-[180px]"
          animate={
            skipAnimations
              ? undefined
              : { x: [0, 50, -30, 0], y: [0, -40, 25, 0] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[15%] w-[700px] h-[700px] rounded-full bg-navy-600/20 blur-[150px]"
          animate={
            skipAnimations
              ? undefined
              : { x: [0, -40, 20, 0], y: [0, 30, -20, 0] }
          }
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[25%] w-[500px] h-[500px] rounded-full bg-gold-500/[0.07] blur-[150px]"
          animate={
            skipAnimations
              ? undefined
              : {
                  scale: [1, 1.2, 0.9, 1],
                  opacity: [0.07, 0.12, 0.05, 0.07],
                }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Extra accent glow */}
        <motion.div
          className="absolute bottom-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-gold-500/[0.04] blur-[120px]"
          animate={
            skipAnimations
              ? undefined
              : {
                  scale: [1, 1.1, 0.95, 1],
                  x: [0, 20, -10, 0],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

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

      {/* Film grain overlay */}
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

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
          {/* Extra floating sparkles */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-gold-400/30 hidden lg:block"
            animate={{ y: [0, -20, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ top: "40%", left: "20%" }}
          />
          <motion.div
            className="absolute w-1 h-1 rounded-full bg-gold-300/25 hidden lg:block"
            animate={{ y: [0, 15, 0], opacity: [0, 0.4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            style={{ top: "30%", right: "25%" }}
          />

          {/* Corner accents */}
          <div
            className="absolute hidden lg:block border-t border-l border-gold-500/10 w-12 h-12"
            style={{ top: "10%", left: "5%" }}
          />
          <div
            className="absolute hidden lg:block border-b border-r border-gold-500/10 w-12 h-12"
            style={{ bottom: "15%", right: "5%" }}
          />
        </>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-container-lg mx-auto px-4 sm:px-6 text-center pt-28 pb-32"
        style={
          !skipAnimations ? { y: titleY, opacity: contentOpacity } : undefined
        }
      >
        {/* Pre-title */}
        <motion.p
          initial={skipAnimations ? undefined : { opacity: 0, y: 15, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-sm sm:text-base tracking-[0.3em] uppercase text-gold-400/70 mb-8 font-medium"
        >
          Oriental Universiteti taqdim etadi
        </motion.p>

        {/* Main title — cinematic entrance */}
        <motion.h1
          initial={skipAnimations ? undefined : { opacity: 0, y: 30, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[11rem] font-black tracking-tight leading-[0.85]"
        >
          <span className="text-white text-glow-white block sm:inline">FAN</span>{" "}
          <span className="text-gradient-gold-shimmer block sm:inline">OLIMPIADASI</span>
        </motion.h1>

        {/* Animated gold underline */}
        <motion.div
          initial={skipAnimations ? undefined : { opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 mb-6 flex justify-center"
        >
          <div className="relative w-32 h-[3px]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-300 to-transparent"
              animate={skipAnimations ? undefined : { opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Year badge */}
        <motion.div
          initial={skipAnimations ? undefined : { opacity: 0, scale: 0.85, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10"
        >
          <span className="badge-shimmer inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/10 text-gold-400 font-mono font-bold text-sm tracking-widest">
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
          initial={skipAnimations ? undefined : { opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          11-sinf o&apos;quvchilari orasida respublika miqyosidagi bilim bellashuvi.
          O&apos;zingizni sinab ko&apos;ring va kelajagingizni yarating.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={skipAnimations ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20"
        >
          <Link href="/register">
            <Button variant="premium" size="xl" className="animate-breathing-glow">
              HOZIROQ RO&apos;YXATDAN O&apos;TING
            </Button>
          </Link>
          <a href="#fanlar">
            <Button variant="outline" size="lg" className="border-white/20 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all duration-300">
              Batafsil ma&apos;lumot
            </Button>
          </a>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={skipAnimations ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-6 font-medium">
            Olimpiada boshlanishiga · Toshkent vaqti
          </p>
          <CountdownTimer />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={skipAnimations ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">
          Pastga suring
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/20" />
        </motion.div>
      </motion.div>

      {/* Bottom fade — smoother transition */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-navy-900/40 to-transparent" />
    </section>
  );
}
