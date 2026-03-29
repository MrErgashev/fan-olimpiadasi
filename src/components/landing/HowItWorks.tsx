"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { PersonIcon, KeyIcon, DocumentIcon, ChartIcon, AwardIcon } from "@/components/ui/Icon3D";
import { cn } from "@/lib/utils";
import { useRef } from "react";

const STEPS = [
  {
    icon: PersonIcon,
    title: "Ro'yxatdan o'ting",
    description: "Access kod orqali platformaga ro'yxatdan o'ting",
    badgeClassName:
      "bg-gradient-to-br from-white via-slate-50 to-gold-50 border border-gold-200/80 shadow-[0_10px_28px_rgba(148,163,184,0.22)] group-hover:shadow-[0_18px_36px_rgba(245,158,11,0.22)]",
    ringClassName: "border-gold-300/40 group-hover:border-gold-400/80",
  },
  {
    icon: KeyIcon,
    title: "Kabinetga kiring",
    description: "Telefon raqam va parol bilan tizimga kiring",
  },
  {
    icon: DocumentIcon,
    title: "Test topshiring",
    description: "Belgilangan vaqtda onlayn test yechishni boshlang",
  },
  {
    icon: ChartIcon,
    title: "Natijalarni ko'ring",
    description: "Test tugagandan so'ng natijalaringizni kuzating",
  },
  {
    icon: AwardIcon,
    title: "Mukofot oling",
    description: "G'oliblar tantanali ravishda taqdirlanadi",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.6"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-navy-950 section-heading">
            Qanday qatnashaman?
          </h2>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Olimpiadada qatnashish juda oddiy — bor-yo&apos;g&apos;i 5 qadam
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) — background */}
          <div className="hidden md:block absolute top-[3.5rem] left-[10%] right-[10%] h-[2px] bg-slate-200" />
          {/* Animated fill line */}
          <motion.div
            className="hidden md:block absolute top-[3.5rem] left-[10%] h-[2px] bg-gradient-to-r from-gold-500 to-gold-400"
            style={{ width: lineWidth }}
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 text-left md:text-center group"
              >
                {/* Number circle with glow */}
                <div
                  className={cn(
                    "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full md:mb-5 md:h-16 md:w-16 transition-all duration-500",
                    step.badgeClassName ?? "bg-navy-950 text-white group-hover:shadow-glow-gold"
                  )}
                >
                  {/* Gold ring on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full border-2 transition-all duration-500",
                      step.ringClassName ?? "border-gold-500/0 group-hover:border-gold-500/30"
                    )}
                  />
                  <step.icon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Mobile: left border accent */}
                <div className="md:hidden absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-gold-500/20 to-transparent" />

                <div>
                  <p className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1 font-mono">
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
