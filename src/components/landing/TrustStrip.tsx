"use client";

import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Users, Building2 } from "lucide-react";

const STATS = [
  { icon: BookOpen, value: "7", label: "ta fan" },
  { icon: CalendarDays, value: "2", label: "kunlik musobaqa" },
  { icon: Users, value: "1000+", label: "ishtirokchi" },
  { icon: Building2, value: "Oriental", label: "Universiteti" },
];

export function TrustStrip() {
  return (
    <section className="relative z-10 -mt-14 rounded-t-3xl bg-white border-b border-slate-100 py-8 sm:py-10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-navy-950 font-mono">
                  {stat.value}
                </span>
                <p className="text-xs sm:text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
