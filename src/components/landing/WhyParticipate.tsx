"use client";

import { motion } from "framer-motion";
import { Trophy, Award, GraduationCap, Star } from "lucide-react";
import { useCallback, useRef } from "react";

const REASONS = [
  {
    icon: Trophy,
    title: "Qimmatbaho sovg'alar",
    description: "Noutbuk, smartfon va boshqa zamonaviy texnologiyalar g'oliblarni kutmoqda.",
    color: "bg-amber-50 text-amber-600",
    glowColor: "rgba(245, 158, 11, 0.15)",
    index: "01",
  },
  {
    icon: GraduationCap,
    title: "Ta'lim granti",
    description: "1-o'rin egalari Oriental Universitetida 1 yillik bepul ta'lim grantiga ega bo'ladi.",
    color: "bg-blue-50 text-blue-600",
    glowColor: "rgba(59, 130, 246, 0.15)",
    index: "02",
  },
  {
    icon: Award,
    title: "Rasmiy sertifikat",
    description: "Barcha ishtirokchilar rasmiy sertifikat bilan taqdirlanadi.",
    color: "bg-emerald-50 text-emerald-600",
    glowColor: "rgba(16, 185, 129, 0.15)",
    index: "03",
  },
  {
    icon: Star,
    title: "Nufuzli tan olinish",
    description: "Respublika miqyosidagi olimpiada natijalaringiz kelajak uchun muhim qadam.",
    color: "bg-violet-50 text-violet-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    index: "04",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

function TiltCard({ children, glowColor }: { children: React.ReactNode; glowColor: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -4;
    const rotateY = (x - centerX) / centerX * 4;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 30px ${glowColor}`;
  }, [glowColor]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    card.style.boxShadow = "";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-full bg-white rounded-2xl p-7 sm:p-8 shadow-card border border-slate-100 transition-[box-shadow] duration-300 will-change-transform relative overflow-hidden group"
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

export function WhyParticipate() {
  return (
    <section className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gold-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-navy-950 section-heading">
            Nima uchun qatnashish kerak?
          </h2>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Fan Olimpiadasi — bu nafaqat bilim sinovi, balki kelajakka yo&apos;l ochuvchi imkoniyat
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {REASONS.map((reason) => (
            <motion.div key={reason.title} variants={item} className="h-full">
              <TiltCard glowColor={reason.glowColor}>
                {/* Background number */}
                <span className="absolute top-4 right-5 text-6xl font-black text-slate-100/60 font-mono select-none pointer-events-none leading-none">
                  {reason.index}
                </span>

                <div className={`w-14 h-14 rounded-xl ${reason.color} flex items-center justify-center mb-6 relative z-10 shadow-sm`}>
                  <reason.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-2 relative z-10">
                  {reason.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                  {reason.description}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
