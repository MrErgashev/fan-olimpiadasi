"use client";

import { motion } from "framer-motion";
import { TrophyIcon, LaptopIcon, SmartphoneIcon, AwardIcon, CrownIcon, SparklesIcon } from "@/components/ui/Icon3D";

const PODIUM = [
  {
    place: 2,
    label: "2-o'rin",
    prize: "Zamonaviy noutbuk",
    Icon: LaptopIcon,
    height: "h-40 sm:h-52",
    color: "from-gray-400 to-gray-300",
    textColor: "text-gray-300",
    bgGlow: "bg-gray-400/10",
    delay: 0.0,
  },
  {
    place: 1,
    label: "1-o'rin",
    prize: "1 yillik ta'lim granti",
    Icon: TrophyIcon,
    height: "h-56 sm:h-72",
    color: "from-gold-500 to-gold-300",
    textColor: "text-gold-400",
    bgGlow: "bg-gold-500/10",
    delay: 0.2,
  },
  {
    place: 3,
    label: "3-o'rin",
    prize: "Smartfon",
    Icon: SmartphoneIcon,
    height: "h-32 sm:h-40",
    color: "from-amber-700 to-amber-500",
    textColor: "text-amber-400",
    bgGlow: "bg-amber-500/10",
    delay: 0.4,
  },
];

export function PrizePodium() {
  return (
    <section
      id="sovgalar"
      className="py-24 sm:py-32 lg:py-40 relative overflow-hidden"
    >
      {/* Background with gold glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800/50 to-green-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/[0.04] blur-[150px]" />

      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-gold-gradient">
            Sovg&apos;alar
          </h2>
          <div className="ornamental-line mt-6 mb-6" />
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto">
            Har bir fan bo&apos;yicha alohida sovg&apos;alar
          </p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 max-w-3xl mx-auto mb-12 sm:mb-16">
          {PODIUM.map((podium) => (
            <motion.div
              key={podium.place}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: podium.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex-1 max-w-[220px]"
            >
              {/* Crown for 1st place */}
              {podium.place === 1 && (
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex justify-center mb-2"
                >
                  <CrownIcon className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg" />
                </motion.div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="relative">
                  <div
                    className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b ${podium.color} shadow-xl`}
                  >
                    <podium.Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  {/* Sparkle particles for 1st place */}
                  {podium.place === 1 && (
                    <>
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2"
                      >
                        <SparklesIcon className="w-4 h-4" />
                      </motion.div>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 0.8, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                        className="absolute -bottom-1 -left-2"
                      >
                        <SparklesIcon className="w-3 h-3" />
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

              {/* Prize text */}
              <p
                className={`text-center text-sm sm:text-base font-medium ${podium.textColor} mb-4`}
              >
                {podium.prize}
              </p>

              {/* Podium block */}
              <div
                className={`${podium.height} rounded-t-2xl bg-gradient-to-b ${podium.color} flex items-start justify-center pt-5 sm:pt-6 relative overflow-hidden`}
              >
                <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-green-900">
                  {podium.label}
                </span>
                {/* Shine sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 animate-shine opacity-60" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4-10 places */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 glass-gold rounded-full px-8 py-4 shadow-glow-gold">
            <AwardIcon className="w-6 h-6" />
            <span className="text-gold-300 font-medium text-sm sm:text-base">
              4-10-o&apos;rin — 1 000 000 so&apos;mlik o&apos;qishga kirish
              voucherlari + turli sovg&apos;alar
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
