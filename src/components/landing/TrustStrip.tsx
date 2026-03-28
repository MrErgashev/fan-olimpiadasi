"use client";

import { motion, useInView } from "framer-motion";
import { BookIcon, CalendarIcon, UsersIcon, BuildingIcon } from "@/components/ui/Icon3D";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl md:text-[2.5rem] font-black text-gradient-gold font-mono tabular-nums counter-glow">
      {count}{suffix}
    </span>
  );
}

const STATS = [
  { icon: BookIcon, value: 7, suffix: "", label: "ta fan", text: false },
  { icon: CalendarIcon, value: 2, suffix: "", label: "kunlik musobaqa", text: false },
  { icon: UsersIcon, value: 1000, suffix: "+", label: "ishtirokchi", text: false },
  { icon: BuildingIcon, value: 0, suffix: "", label: "Universiteti", text: "Oriental" },
];

export function TrustStrip() {
  return (
    <section className="relative z-10 -mt-16 bg-white rounded-t-[2rem] border-b border-slate-100 py-10 sm:py-14 shadow-[0_-12px_40px_rgba(0,0,0,0.1)]">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex items-center gap-4 justify-center group cursor-default hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Gold left accent */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full bg-gradient-to-b from-gold-500/0 via-gold-500/40 to-gold-500/0 hidden md:block group-first:hidden" />

              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500/15 group-hover:shadow-glow-gold transition-all duration-300">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                {stat.text ? (
                  <span className="text-3xl sm:text-4xl md:text-[2.5rem] font-black text-gradient-gold font-mono">
                    {stat.text}
                  </span>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
