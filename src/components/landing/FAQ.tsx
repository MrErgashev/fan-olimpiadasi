"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SendIcon } from "@/components/ui/Icon3D";
import { CONTACT_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "Kimlar qatnashishi mumkin?",
    a: "Fan Olimpiadasida 11-sinf o'quvchilari qatnashishi mumkin. Respublikaning barcha viloyatlaridan ishtirokchilar qabul qilinadi.",
  },
  {
    q: "Qanday ro'yxatdan o'taman?",
    a: "Ro'yxatdan o'tish uchun sizga maxsus access kod kerak. Kodni maktab orqali yoki Telegram kanalimiz orqali olishingiz mumkin. Kod bilan platformaga kiring va shaxsiy ma'lumotlaringizni to'ldiring.",
  },
  {
    q: "Access kod nima va qayerdan olaman?",
    a: "Access kod — platformaga ro'yxatdan o'tish uchun kerak bo'lgan maxsus kalit. Uni maktabingiz ma'muriyati yoki bizning Telegram kanalimiz orqali olishingiz mumkin.",
  },
  {
    q: "Olimpiada qachon bo'ladi?",
    a: "Olimpiada 2026-yil 30-31 mart kunlari bo'lib o'tadi. 30-mart kuni: Matematika, Informatika, Tarix, Ona tili va adabiyoti. 31-mart kuni: Ingliz tili, Biologiya, Jismoniy tarbiya.",
  },
  {
    q: "Test qanday formatda o'tkaziladi?",
    a: "Onlayn fanlar (Matematika, Informatika, Tarix, Ingliz tili, Biologiya, Ona tili va adabiyoti) test formatida — 30 ta savol, 90 daqiqa vaqt. Jismoniy tarbiya offline formatda o'tkaziladi.",
  },
  {
    q: "Natijalar qachon e'lon qilinadi?",
    a: "Onlayn testlar natijalari test tugagandan keyin tezda chop etiladi. Umumiy natijalar va g'oliblar ro'yxati olimpiada yakunlangandan so'ng e'lon qilinadi.",
  },
  {
    q: "Qanday sovg'alar bor?",
    a: "Har bir fan bo'yicha: 1-o'rin — 1 yillik ta'lim granti, 2-o'rin — zamonaviy noutbuk, 3-o'rin — smartfon. 4-10 o'rinlar uchun 1,000,000 so'mlik voucherlar va turli sovg'alar.",
  },
  {
    q: "Muammo bo'lsa kimga murojaat qilaman?",
    a: `Telegram orqali bog'laning: ${CONTACT_INFO.telegram.join(", ")}. Manzil: ${CONTACT_INFO.address}.`,
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "border-b border-slate-100 last:border-b-0 transition-colors duration-300",
        isOpen && "bg-gold-500/[0.02]"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-5 px-1 text-left group"
      >
        {/* Gold left accent when open */}
        <div className={cn(
          "absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gold-500 transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )} />

        <span className={cn(
          "text-base font-medium transition-colors duration-200",
          isOpen ? "text-navy-950" : "text-navy-950/80 group-hover:text-navy-950"
        )}>
          {question}
        </span>
        <span className="shrink-0 mt-0.5">
          <Plus
            className={cn(
              "w-5 h-5 transition-all duration-300",
              isOpen ? "rotate-45 text-gold-500" : "rotate-0 text-slate-400 group-hover:text-slate-600"
            )}
          />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 px-1 text-sm text-slate-500 leading-relaxed pr-10">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-slate-50 scroll-mt-20">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* FAQ */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 mb-2 section-heading" style={{ textAlign: "left" }}>
                Ko&apos;p beriladigan savollar
              </h2>
              <p className="text-slate-500 mb-8 mt-6">
                Olimpiada haqida eng muhim savollar va javoblar
              </p>
            </motion.div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-card px-6 sm:px-8 relative overflow-hidden">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} index={i} />
              ))}
            </div>
          </div>

          {/* Contact sidebar */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-navy-950 mb-2">
                Bog&apos;lanish
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Savollaringiz bormi? Biz bilan bog&apos;laning
              </p>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 hover:shadow-card-hover hover:border-gold-500/10 transition-all duration-300"
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Manzil
                </p>
                <p className="text-sm text-navy-950 font-medium">
                  {CONTACT_INFO.address}
                </p>
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                  <iframe
                    src="https://yandex.uz/map-widget/v1/-/CHWg7YIE"
                    width="100%"
                    height="200"
                    frameBorder="0"
                    allowFullScreen
                    className="block"
                    title="Oriental Universiteti manzili"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 hover:shadow-card-hover hover:border-gold-500/10 transition-all duration-300"
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Telegram
                </p>
                <div className="space-y-2">
                  {CONTACT_INFO.telegram.map((handle) => (
                    <a
                      key={handle}
                      href={`https://t.me/${handle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors group"
                    >
                      <SendIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                      {handle}
                    </a>
                  ))}
                </div>
              </motion.div>

              <motion.a
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                href="https://t.me/Dilya0103"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-navy-950 text-white rounded-xl px-6 py-4 font-semibold text-sm hover:bg-navy-800 transition-all duration-300 hover:shadow-lg group"
              >
                <SendIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                Telegram orqali yozing
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
