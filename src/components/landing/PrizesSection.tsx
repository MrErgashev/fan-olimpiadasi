"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { FLUENT_3D } from "@/lib/constants";

const PRIZES = [
  {
    place: 1,
    label: "1-O'RIN",
    prize: "1 yillik ta'lim granti",
    description: "Oriental Universitetida 1 yillik bepul ta'lim",
    image: `${FLUENT_3D}/Trophy/3D/trophy_3d.png`,
    accentColor: "border-gold-500",
    accentGlow: "bg-gold-500/20",
    numberColor: "text-gold-400",
    badgeBg: "bg-gold-500",
    height: "h-56 sm:h-64",
  },
  {
    place: 2,
    label: "2-O'RIN",
    prize: "Zamonaviy noutbuk",
    description: "Eng so'nggi modeldagi noutbuk",
    image: `${FLUENT_3D}/Laptop/3D/laptop_3d.png`,
    accentColor: "border-slate-400",
    accentGlow: "bg-slate-400/20",
    numberColor: "text-slate-300",
    badgeBg: "bg-slate-400",
    height: "h-44 sm:h-52",
  },
  {
    place: 3,
    label: "3-O'RIN",
    prize: "Smartfon",
    description: "Zamonaviy smartfon",
    image: `${FLUENT_3D}/Mobile%20phone/3D/mobile_phone_3d.png`,
    accentColor: "border-amber-600",
    accentGlow: "bg-amber-600/20",
    numberColor: "text-amber-500",
    badgeBg: "bg-amber-600",
    height: "h-40 sm:h-48",
  },
];

const PODIUM_ORDER = [PRIZES[1], PRIZES[0], PRIZES[2]];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const pedestalVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.85 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function PrizesSection() {
  return (
    <section id="sovgalar" className="py-24 sm:py-32 bg-slate-50 scroll-mt-20">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-navy-950 section-heading">
            Sovg&apos;alar
          </h2>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Har bir fan bo&apos;yicha alohida sovg&apos;alar — g&apos;oliblar
            qimmatbaho mukofotlarga ega bo&apos;ladi
          </p>
        </motion.div>

        {/* Podium container */}
        <div className="relative max-w-4xl mx-auto mb-10 rounded-3xl bg-navy-950 overflow-hidden">
          {/* Background glow effects — enhanced */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-gold-500/[0.08] blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-navy-600/30 blur-[80px]" />
            {/* Spotlight beam for 1st place */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-full bg-gradient-to-b from-gold-500/[0.06] via-gold-500/[0.02] to-transparent" />
          </div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-16 pb-0">
            {/* Mobile: 1, 2, 3 tartibda vertikal */}
            <div className="flex flex-col gap-8 md:hidden">
              {PRIZES.map((prize, i) => (
                <motion.div
                  key={prize.place}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="text-center"
                >
                  <div className="relative mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full ${prize.accentGlow} blur-3xl scale-[2]`} />
                    <motion.img
                      src={prize.image}
                      alt={prize.prize}
                      className="relative w-24 h-24 mx-auto object-contain drop-shadow-2xl"
                      loading="lazy"
                      animate={prize.place === 1 ? { y: [0, -6, 0] } : undefined}
                      transition={prize.place === 1 ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
                    />
                  </div>

                  <div className={`relative rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 border-t-2 ${prize.accentColor} p-6`}>
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${prize.badgeBg} text-white text-sm font-bold mb-2 shadow-lg`}>
                      {prize.place}
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${prize.numberColor} mb-1`}>
                      {prize.label}
                    </p>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {prize.prize}
                    </h3>
                    <p className="text-sm text-white/50">
                      {prize.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: 2, 1, 3 podium layout */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="hidden md:flex items-end justify-center gap-4 lg:gap-6"
            >
              {PODIUM_ORDER.map((prize) => (
                <motion.div
                  key={prize.place}
                  variants={pedestalVariants}
                  className={`flex-1 max-w-[280px] text-center ${prize.place === 1 ? "order-2" : prize.place === 2 ? "order-1" : "order-3"}`}
                >
                  {/* Product image floating above pedestal */}
                  <div className="relative mb-[-24px] z-10">
                    <div className={`absolute inset-0 rounded-full ${prize.accentGlow} blur-3xl scale-[2.5]`} />
                    {/* Sparkles around 1st place */}
                    {prize.place === 1 && (
                      <>
                        <motion.div
                          className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-gold-400"
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="absolute top-0 -right-3 w-1.5 h-1.5 rounded-full bg-gold-300"
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                        />
                        <motion.div
                          className="absolute -bottom-1 left-1 w-1 h-1 rounded-full bg-gold-200"
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1.3 }}
                        />
                      </>
                    )}
                    <motion.img
                      src={prize.image}
                      alt={prize.prize}
                      className={`relative mx-auto object-contain drop-shadow-2xl ${prize.place === 1 ? "w-32 h-32 lg:w-36 lg:h-36" : "w-22 h-22 lg:w-26 lg:h-26"}`}
                      loading="lazy"
                      animate={prize.place === 1 ? { y: [0, -8, 0] } : undefined}
                      transition={prize.place === 1 ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
                    />
                  </div>

                  {/* Pedestal */}
                  <div
                    className={`relative ${prize.height} rounded-t-2xl bg-gradient-to-b from-navy-800/90 to-navy-900 border-t-[3px] ${prize.accentColor} flex flex-col items-center justify-center px-4 overflow-hidden`}
                  >
                    {/* Gold shimmer line at top */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

                    {/* Shine sweep on 1st place */}
                    {prize.place === 1 && <div className="shine-sweep absolute inset-0" />}

                    {/* Big number */}
                    <span className={`font-display text-6xl lg:text-7xl font-black ${prize.numberColor} opacity-90 leading-none mb-2`}>
                      {prize.place}
                    </span>

                    <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${prize.numberColor} mb-2`}>
                      {prize.label}
                    </p>
                    <h3 className="text-base lg:text-lg font-bold text-white mb-1 leading-tight">
                      {prize.prize}
                    </h3>
                    <p className="text-xs text-white/40 leading-snug">
                      {prize.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Platform base line */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
          </div>
        </div>

        {/* 4-10 places */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-7 py-3.5 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow duration-300">
            <Award className="w-5 h-5 text-gold-500" />
            <span className="text-slate-600 font-medium text-sm">
              4-10 o&apos;rin — 1 000 000 so&apos;mlik voucherlar + turli
              sovg&apos;alar
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
