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

const ACCENT_MAP: Record<string, { bar: string; icon: string; bg: string }> = {
  matematika: { bar: "bg-blue-500", icon: "text-blue-600", bg: "bg-blue-50" },
  informatika: { bar: "bg-cyan-500", icon: "text-cyan-600", bg: "bg-cyan-50" },
  tarix: { bar: "bg-amber-500", icon: "text-amber-600", bg: "bg-amber-50" },
  "ingliz-tili": { bar: "bg-red-500", icon: "text-red-600", bg: "bg-red-50" },
  biologiya: { bar: "bg-emerald-500", icon: "text-emerald-600", bg: "bg-emerald-50" },
  "ona-tili": { bar: "bg-violet-500", icon: "text-violet-600", bg: "bg-violet-50" },
  "jismoniy-tarbiya": { bar: "bg-orange-500", icon: "text-orange-600", bg: "bg-orange-50" },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function SubjectsGrid() {
  return (
    <section id="fanlar" className="py-20 sm:py-28 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950">
            Olimpiada fanlari
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            7 ta fan bo&apos;yicha o&apos;z bilimingizni sinab ko&apos;ring
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {SUBJECTS.map((subject) => {
            const Icon = ICON_MAP[subject.icon];
            const accent = ACCENT_MAP[subject.slug] || ACCENT_MAP.matematika;

            return (
              <motion.div
                key={subject.slug}
                variants={item}
                className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Color accent bar */}
                <div className={`h-1 ${accent.bar}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${accent.bg}`}>
                      {Icon && <Icon className={`w-6 h-6 ${accent.icon}`} />}
                    </div>
                    <img
                      src={subject.image}
                      alt={subject.name}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-navy-950 mb-3">
                    {subject.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={subject.isOnline ? "success" : "warning"}
                      size="sm"
                    >
                      {subject.isOnline ? "Onlayn" : "Offline"}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      30 savol · 90 daq
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
