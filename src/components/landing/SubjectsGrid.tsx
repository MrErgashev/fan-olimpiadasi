"use client";

import { Badge } from "@/components/ui/Badge";
import { SUBJECTS } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  Calculator,
  Monitor,
  BookOpen,
  Globe,
  Dna,
  BookText,
  Dumbbell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  Monitor,
  BookOpen,
  Globe,
  Dna,
  BookText,
  Dumbbell,
};

const ACCENT_MAP: Record<string, { bar: string; icon: string; bg: string; glow: string }> = {
  matematika: { bar: "bg-blue-500", icon: "text-blue-600", bg: "bg-blue-50", glow: "rgba(59, 130, 246, 0.12)" },
  informatika: { bar: "bg-cyan-500", icon: "text-cyan-600", bg: "bg-cyan-50", glow: "rgba(6, 182, 212, 0.12)" },
  tarix: { bar: "bg-amber-500", icon: "text-amber-600", bg: "bg-amber-50", glow: "rgba(245, 158, 11, 0.12)" },
  "ingliz-tili": { bar: "bg-red-500", icon: "text-red-600", bg: "bg-red-50", glow: "rgba(239, 68, 68, 0.12)" },
  biologiya: { bar: "bg-emerald-500", icon: "text-emerald-600", bg: "bg-emerald-50", glow: "rgba(16, 185, 129, 0.12)" },
  "ona-tili": { bar: "bg-violet-500", icon: "text-violet-600", bg: "bg-violet-50", glow: "rgba(139, 92, 246, 0.12)" },
  "jismoniy-tarbiya": { bar: "bg-orange-500", icon: "text-orange-600", bg: "bg-orange-50", glow: "rgba(249, 115, 22, 0.12)" },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export function SubjectsGrid() {
  return (
    <section id="fanlar" className="py-24 sm:py-32 bg-white relative overflow-hidden scroll-mt-20">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #0a1628 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="max-w-container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-navy-950 section-heading">
            Olimpiada fanlari
          </h2>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            7 ta fan bo&apos;yicha o&apos;z bilimingizni sinab ko&apos;ring
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-wrap justify-center gap-5"
        >
          {SUBJECTS.map((subject) => {
            const Icon = ICON_MAP[subject.icon];
            const accent = ACCENT_MAP[subject.slug] || ACCENT_MAP.matematika;

            return (
              <motion.div
                key={subject.slug}
                variants={item}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.8334rem)] xl:w-[calc(25%-0.9375rem)] group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden relative"
              >
                {/* Color accent bar — expands on hover */}
                <div className={`h-1 group-hover:h-1.5 transition-all duration-300 ${accent.bar}`} />

                {/* Hover glow overlay */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                  style={{ background: accent.glow }}
                />

                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-3 rounded-xl ${accent.bg} group-hover:shadow-md transition-shadow duration-300`}>
                      {Icon && <Icon className={`w-6 h-6 ${accent.icon}`} />}
                    </div>
                    <img
                      src={subject.image}
                      alt={subject.name}
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-navy-950 mb-3 group-hover:text-navy-800 transition-colors">
                    {subject.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={subject.mode === "online+offline" ? "info" : "warning"}
                      size="sm"
                    >
                      {subject.mode === "online+offline" ? "Onlayn+Offline" : "Offline"}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium font-mono">
                      {subject.slug === "jismoniy-tarbiya" ? "90 daq" : "30 savol · 90 daq"}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
