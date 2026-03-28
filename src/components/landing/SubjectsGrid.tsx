"use client";

import { Card } from "@/components/ui/Card";
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

// Subject-specific accent colors
const ACCENT_MAP: Record<string, { gradient: string; border: string; text: string; bg: string }> = {
  matematika: {
    gradient: "from-blue-500 to-purple-500",
    border: "border-blue-500/30",
    text: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  informatika: {
    gradient: "from-cyan-500 to-blue-500",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
  tarix: {
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    text: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  "ingliz-tili": {
    gradient: "from-red-500 to-pink-500",
    border: "border-red-500/30",
    text: "text-red-400",
    bg: "bg-red-500/20",
  },
  biologiya: {
    gradient: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  "ona-tili": {
    gradient: "from-violet-500 to-purple-500",
    border: "border-violet-500/30",
    text: "text-violet-400",
    bg: "bg-violet-500/20",
  },
  "jismoniy-tarbiya": {
    gradient: "from-orange-500 to-red-500",
    border: "border-orange-500/30",
    text: "text-orange-400",
    bg: "bg-orange-500/20",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function SubjectsGrid() {
  return (
    <section id="fanlar" className="py-24 sm:py-32 lg:py-40 relative">
      <div className="absolute inset-0 spotlight opacity-50" />
      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-gold-gradient">
            Olimpiada fanlari
          </h2>
          <div className="ornamental-line mt-6 mb-6" />
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            7 ta fan bo&apos;yicha o&apos;z bilimingizni sinab ko&apos;ring
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
        >
          {SUBJECTS.map((subject) => {
            const Icon = ICON_MAP[subject.icon];
            const accent = ACCENT_MAP[subject.slug] || ACCENT_MAP.matematika;

            return (
              <motion.div key={subject.slug} variants={item}>
                <Card
                  hover
                  variant="glass"
                  className="group relative overflow-hidden p-7 sm:p-8"
                >
                  {/* Accent top border */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Glow effect on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${accent.gradient} mix-blend-overlay`}
                    style={{ opacity: 0 }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className={`p-3.5 rounded-2xl ${accent.bg} ${accent.border} border group-hover:shadow-lg transition-all duration-300`}
                      >
                        {Icon && (
                          <Icon
                            className={`w-7 h-7 ${accent.text} transition-colors duration-300`}
                          />
                        )}
                      </div>
                      <span className="text-3xl sm:text-4xl">
                        {subject.emoji}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3">
                      {subject.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={subject.isOnline ? "success" : "warning"}
                        size="md"
                      >
                        {subject.isOnline ? "Onlayn test" : "Offline"}
                      </Badge>
                      <span className="text-xs text-white/30">
                        30 savol · 90 daq
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
