"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Users, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-navy-950 pt-40 sm:pt-48 pb-24 sm:pb-32 relative overflow-hidden">
      {/* Top gradient fade from FAQ's bg-slate-50 */}
      <div className="absolute top-0 left-0 right-0 h-40 sm:h-48 bg-gradient-to-b from-slate-50 via-slate-50/0 to-transparent" style={{ top: "-1px" }} />
      {/* Multi-layered background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gold-500/[0.06] blur-[150px]" />
        {/* Top-left accent */}
        <motion.div
          className="absolute top-0 left-[20%] w-[400px] h-[300px] rounded-full bg-navy-600/20 blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bottom-right accent */}
        <motion.div
          className="absolute bottom-0 right-[20%] w-[300px] h-[200px] rounded-full bg-gold-500/[0.04] blur-[80px]"
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-wider uppercase mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Joylar cheklangan
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-white mb-5 leading-tight">
            Olimpiadaga tayyormisiz?
          </h2>
          <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
            Hoziroq ro&apos;yxatdan o&apos;ting va o&apos;z bilimingizni sinab ko&apos;ring.
            Katta sovg&apos;alar sizni kutmoqda!
          </p>

          <Link href="/register">
            <Button variant="premium" size="xl" className="animate-breathing-glow">
              RO&apos;YXATDAN O&apos;TISH
            </Button>
          </Link>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-10"
          >
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <Users className="w-4 h-4" />
              <span>1000+ ishtirokchi</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <BookOpen className="w-4 h-4" />
              <span>7 ta fan</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
