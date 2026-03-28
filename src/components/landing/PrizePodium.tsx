"use client";

import { motion } from "framer-motion";
import { Trophy, Laptop, Smartphone, Award } from "lucide-react";

const PODIUM = [
  {
    place: 2,
    label: "2-o'rin",
    prize: "Zamonaviy noutbuk",
    Icon: Laptop,
    height: "h-32 sm:h-40",
    color: "from-gray-400 to-gray-300",
    textColor: "text-gray-300",
    delay: 0.3,
  },
  {
    place: 1,
    label: "1-o'rin",
    prize: "1 yillik ta'lim granti",
    Icon: Trophy,
    height: "h-44 sm:h-56",
    color: "from-gold-500 to-gold-300",
    textColor: "text-gold-400",
    delay: 0.1,
  },
  {
    place: 3,
    label: "3-o'rin",
    prize: "Smartfon",
    Icon: Smartphone,
    height: "h-24 sm:h-32",
    color: "from-amber-700 to-amber-500",
    textColor: "text-amber-400",
    delay: 0.5,
  },
];

export function PrizePodium() {
  return (
    <section id="sovgalar" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800/50 to-green-900" />

      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient">
            Sovg&apos;alar
          </h2>
          <p className="mt-4 text-white/50">
            Har bir fan bo&apos;yicha alohida sovg&apos;alar
          </p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto mb-10">
          {PODIUM.map((item) => (
            <motion.div
              key={item.place}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: item.delay }}
              className="flex-1 max-w-[180px]"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className={`p-3 sm:p-4 rounded-full bg-gradient-to-b ${item.color} shadow-lg`}
                >
                  <item.Icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-900" />
                </div>
              </div>

              {/* Prize text */}
              <p className={`text-center text-sm font-medium ${item.textColor} mb-3`}>
                {item.prize}
              </p>

              {/* Podium block */}
              <div
                className={`${item.height} rounded-t-xl bg-gradient-to-b ${item.color} flex items-start justify-center pt-4 relative overflow-hidden`}
              >
                <span className="text-2xl sm:text-3xl font-display font-bold text-green-900">
                  {item.label}
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4-10 badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 glass gold-border rounded-full px-6 py-3">
            <Award className="w-5 h-5 text-gold-400" />
            <span className="text-gold-300 font-medium">
              4-10-o&apos;rin — 1 000 000 so&apos;mlik o&apos;qishga kirish voucherlari +
              turli sovg&apos;alar
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
