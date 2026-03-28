"use client";

import { SCHEDULE } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function Schedule() {
  return (
    <section id="jadval" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 spotlight opacity-30" />

      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient">
            Jadval
          </h2>
          <p className="mt-4 text-white/50">
            Olimpiada sanalari va vaqtlari
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {SCHEDULE.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <Card variant="gold" className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg gradient-gold">
                    <Calendar className="w-5 h-5 text-green-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-gold-400">
                      {day.date}
                    </h3>
                    <p className="text-sm text-white/50">{day.day}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-white/60">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-sm">{day.time}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {day.subjects.map((subject) => (
                    <Badge key={subject} variant="default">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
