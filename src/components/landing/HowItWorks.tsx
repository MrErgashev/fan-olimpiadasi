"use client";

import { motion } from "framer-motion";
import { UserPlus, KeyRound, FileText, BarChart3, Award } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Ro'yxatdan o'ting",
    description: "Access kod orqali platformaga ro'yxatdan o'ting",
  },
  {
    icon: KeyRound,
    title: "Kabinetga kiring",
    description: "Telefon raqam va parol bilan tizimga kiring",
  },
  {
    icon: FileText,
    title: "Test topshiring",
    description: "Belgilangan vaqtda onlayn test yechishni boshlang",
  },
  {
    icon: BarChart3,
    title: "Natijalarni ko'ring",
    description: "Test tugagandan so'ng natijalaringizni kuzating",
  },
  {
    icon: Award,
    title: "Mukofot oling",
    description: "G'oliblar tantanali ravishda taqdirlanadi",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950">
            Qanday qatnashaman?
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Olimpiadada qatnashish juda oddiy — bor-yo&apos;g&apos;i 5 qadam
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[10%] right-[10%] h-[2px] bg-slate-200" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 text-left md:text-center"
              >
                {/* Number circle */}
                <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-navy-950 text-white flex items-center justify-center shrink-0 md:mb-4">
                  <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                <div>
                  <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">
                    {i + 1}-qadam
                  </p>
                  <h3 className="font-semibold text-navy-950 mb-1 text-sm sm:text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
