"use client";

import { SCHEDULE, SUBJECTS } from "@/lib/constants";
import { Clock, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const SUBJECT_COLORS: Record<string, string> = {
  Matematika: "bg-blue-50 text-blue-700 border-blue-200",
  Informatika: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Tarix: "bg-amber-50 text-amber-700 border-amber-200",
  "Ingliz tili": "bg-red-50 text-red-700 border-red-200",
  Biologiya: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Ona tili va adabiyoti": "bg-violet-50 text-violet-700 border-violet-200",
  "Jismoniy tarbiya": "bg-orange-50 text-orange-700 border-orange-200",
};

export function Schedule() {
  return (
    <section id="jadval" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950">
            Olimpiada jadvali
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Olimpiada sanalari va vaqtlari
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {SCHEDULE.map((day, i) => {
            const dateNum = day.date.split("-")[0];
            const dateMonth = day.date.split("-")[1];

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                {/* Header with date */}
                <div className="bg-navy-950 px-7 py-5 flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-white leading-none block">
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
                <div className="px-7 py-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Fanlar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {day.subjects.map((subject) => {
                      const colors =
                        SUBJECT_COLORS[subject] || "bg-slate-50 text-slate-600 border-slate-200";
                      const emoji = SUBJECTS.find((s) => s.name === subject)?.emoji;
                      return (
                        <span
                          key={subject}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${colors}`}
                        >
                          {emoji && <span className="mr-1.5">{emoji}</span>}
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
