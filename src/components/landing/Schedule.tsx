"use client";

import { SCHEDULE, SUBJECTS } from "@/lib/constants";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

// Map subject names to accent colors
const SUBJECT_COLORS: Record<string, string> = {
  Matematika: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Informatika: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Tarix: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Ingliz tili": "bg-red-500/20 text-red-400 border-red-500/30",
  Biologiya: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Ona tili va adabiyoti": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Jismoniy tarbiya": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function Schedule() {
  return (
    <section id="jadval" className="py-24 sm:py-32 lg:py-40 relative">
      <div className="absolute inset-0 spotlight opacity-30" />

      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-gold-gradient">
            Jadval
          </h2>
          <div className="ornamental-line mt-6 mb-6" />
          <p className="text-lg sm:text-xl text-white/50">
            Olimpiada sanalari va vaqtlari
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical gold line */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold-500/40 to-transparent sm:-translate-x-[1px]" />

          {SCHEDULE.map((day, i) => {
            const dateNum = day.date.split("-")[0];
            const dateMonth = day.date.split("-")[1];

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className={`relative flex items-start gap-8 mb-12 sm:mb-16 ${
                  i % 2 === 0
                    ? "sm:flex-row sm:pr-[50%]"
                    : "sm:flex-row-reverse sm:pl-[50%]"
                }`}
              >
                {/* Timeline node */}
                <div className="absolute left-6 sm:left-1/2 w-4 h-4 rounded-full bg-gold-500 border-4 border-green-900 -translate-x-[7px] sm:-translate-x-[8px] top-3 z-10 shadow-glow-gold" />

                {/* Card */}
                <div className="ml-14 sm:ml-0 flex-1 glass-gold rounded-2xl p-7 sm:p-8 hover:shadow-glow-gold transition-shadow duration-500">
                  {/* Date */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-5xl sm:text-6xl font-mono font-black text-gold-400 text-glow-gold leading-none">
                      {dateNum}
                    </span>
                    <div>
                      <span className="text-sm uppercase tracking-[0.2em] text-white/40 block">
                        {dateMonth} · {day.day}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 mb-5 text-white/60">
                    <Clock className="w-4 h-4 text-gold-400/60" />
                    <span className="font-mono text-base">{day.time}</span>
                  </div>

                  {/* Subject pills */}
                  <div className="flex flex-wrap gap-2">
                    {day.subjects.map((subject) => {
                      const colors =
                        SUBJECT_COLORS[subject] ||
                        "bg-green-700/50 text-green-300 border-green-500/30";
                      return (
                        <span
                          key={subject}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${colors}`}
                        >
                          {
                            SUBJECTS.find((s) => s.name === subject)?.emoji
                          }{" "}
                          {subject}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
