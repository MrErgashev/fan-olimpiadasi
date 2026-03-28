"use client";

import { motion } from "framer-motion";
import { Trophy, Laptop, Smartphone, Award } from "lucide-react";

const PRIZES = [
  {
    place: 1,
    label: "1-o'rin",
    prize: "1 yillik ta'lim granti",
    description: "Oriental Universitetida 1 yillik bepul ta'lim",
    Icon: Trophy,
    accent: "border-gold-500 bg-gradient-to-b from-gold-100/50 to-white",
    iconBg: "bg-gold-500",
    iconColor: "text-white",
    textColor: "text-gold-600",
    badge: "bg-gold-500 text-white",
  },
  {
    place: 2,
    label: "2-o'rin",
    prize: "Zamonaviy noutbuk",
    description: "Eng so'nggi modeldagi noutbuk",
    Icon: Laptop,
    accent: "border-slate-300 bg-gradient-to-b from-slate-50 to-white",
    iconBg: "bg-slate-400",
    iconColor: "text-white",
    textColor: "text-slate-600",
    badge: "bg-slate-400 text-white",
  },
  {
    place: 3,
    label: "3-o'rin",
    prize: "Smartfon",
    description: "Zamonaviy smartfon",
    Icon: Smartphone,
    accent: "border-amber-600/30 bg-gradient-to-b from-amber-50/50 to-white",
    iconBg: "bg-amber-600",
    iconColor: "text-white",
    textColor: "text-amber-700",
    badge: "bg-amber-600 text-white",
  },
];

export function PrizesSection() {
  return (
    <section id="sovgalar" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950">
            Sovg&apos;alar
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Har bir fan bo&apos;yicha alohida sovg&apos;alar — g&apos;oliblar qimmatbaho mukofotlarga ega bo&apos;ladi
          </p>
        </div>

        {/* Prize cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {PRIZES.map((prize, i) => (
            <motion.div
              key={prize.place}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 ${prize.accent} p-8 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ${prize.place === 1 ? "md:-mt-4 md:pb-10 shadow-premium" : "shadow-card"}`}
            >
              {/* Place badge */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${prize.badge} text-sm font-bold mb-5`}>
                {prize.place}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl ${prize.iconBg} flex items-center justify-center mx-auto mb-5`}>
                <prize.Icon className={`w-8 h-8 ${prize.iconColor}`} />
              </div>

              {/* Prize info */}
              <p className={`text-sm font-semibold uppercase tracking-wider ${prize.textColor} mb-2`}>
                {prize.label}
              </p>
              <h3 className="text-xl font-bold text-navy-950 mb-2">
                {prize.prize}
              </h3>
              <p className="text-sm text-slate-500">
                {prize.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 4-10 places */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-card border border-slate-100">
            <Award className="w-5 h-5 text-gold-500" />
            <span className="text-slate-600 font-medium text-sm">
              4-10 o&apos;rin — 1 000 000 so&apos;mlik voucherlar + turli sovg&apos;alar
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
