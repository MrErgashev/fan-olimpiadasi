"use client";

import { motion } from "framer-motion";
import { Trophy, Award, GraduationCap, Star } from "lucide-react";

const REASONS = [
  {
    icon: Trophy,
    title: "Qimmatbaho sovg'alar",
    description: "Noutbuk, smartfon va boshqa zamonaviy texnologiyalar g'oliblarni kutmoqda.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: GraduationCap,
    title: "Ta'lim granti",
    description: "1-o'rin egalari Oriental Universitetida 1 yillik bepul ta'lim grantiga ega bo'ladi.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Award,
    title: "Rasmiy sertifikat",
    description: "Barcha ishtirokchilar rasmiy sertifikat bilan taqdirlanadi.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Star,
    title: "Nufuzli tan olinish",
    description: "Respublika miqyosidagi olimpiada natijalaringiz kelajak uchun muhim qadam.",
    color: "bg-violet-50 text-violet-600",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WhyParticipate() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950">
            Nima uchun qatnashish kerak?
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Fan Olimpiadasi — bu nafaqat bilim sinovi, balki kelajakka yo&apos;l ochuvchi imkoniyat
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {REASONS.map((reason) => (
            <motion.div
              key={reason.title}
              variants={item}
              className="bg-white rounded-2xl p-7 shadow-card border border-slate-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${reason.color} flex items-center justify-center mb-5`}>
                <reason.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-950 mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
