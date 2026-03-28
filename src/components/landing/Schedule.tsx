"use client";

import { SCHEDULE, SUBJECTS } from "@/lib/constants";
import { Clock, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const SUBJECT_COLORS: Record<string, string> = {
  Matematika: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  Informatika: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
  Tarix: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  "Ingliz tili": "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  Biologiya: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  "Ona tili va adabiyoti": "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
  "Jismoniy tarbiya": "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
};

export function Schedule() {
  return (
    <section id="jadval" className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden scroll-mt-20">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gold-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-navy-950 section-heading">
            Olimpiada jadvali
          </h2>
          <p className="mt-6 text-lg text-slate-500">
            Olimpiada sanalari va vaqtlari
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {SCHEDULE.map((day, i) => {
            const dateNum = day.date.split("-")[0];
            const dateMonth = day.date.split("-")[1];

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group relative"
              >
                {/* Gold left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold-500/40 via-gold-500/20 to-gold-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header with date */}
                <div className="bg-navy-950 px-7 py-6 flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-4xl sm:text-5xl font-mono font-black text-gradient-gold leading-none block counter-glow">
                      {dateNum}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
                      {dateMonth}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div>
                    <p className="text-white font-semibold">{day.day}</p>
                    <div className="flex items-center gap-1.5 text-white/50 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono">{day.time}</span>
                    </div>
                  </div>
                  <CalendarDays className="w-5 h-5 text-gold-400/60 ml-auto" />
                </div>

                {/* Subject pills */}
                <div className="px-7 py-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Fanlar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {day.subjects.map((subject) => {
                      const colors =
                        SUBJECT_COLORS[subject] || "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
                      const subjectData = SUBJECTS.find((s) => s.name === subject);
                      return (
                        <span
                          key={subject}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-default hover:scale-[1.03] hover:shadow-sm ${colors}`}
                        >
                          {subjectData?.image && (
                            <img
                              src={subjectData.image}
                              alt={subject}
                              className="w-4 h-4 object-contain mr-1.5"
                              loading="lazy"
                            />
                          )}
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
