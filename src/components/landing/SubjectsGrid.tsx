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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function SubjectsGrid() {
  return (
    <section id="fanlar" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 spotlight opacity-50" />
      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient">
            Olimpiada fanlari
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            7 ta fan bo&apos;yicha o&apos;z bilimingizni sinab ko&apos;ring
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {SUBJECTS.map((subject) => {
            const Icon = ICON_MAP[subject.icon];
            return (
              <motion.div key={subject.slug} variants={item}>
                <Card hover variant="glass" className="group relative overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-500/10 to-gold-500/5" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-green-700/30 border border-green-500/20 group-hover:border-gold-500/30 transition-colors">
                        {Icon && (
                          <Icon className="w-6 h-6 text-green-400 group-hover:text-gold-400 transition-colors" />
                        )}
                      </div>
                      <span className="text-2xl">{subject.emoji}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                      {subject.name}
                    </h3>

                    <Badge variant={subject.isOnline ? "success" : "warning"}>
                      {subject.isOnline ? "Onlayn test" : "Offline"}
                    </Badge>
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
