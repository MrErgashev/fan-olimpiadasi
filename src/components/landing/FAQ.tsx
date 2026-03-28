"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Send } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";

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
    a: "Onlayn fanlar (Matematika, Informatika, Tarix, Ingliz tili, Biologiya) test formatida — 30 ta savol, 90 daqiqa vaqt. Ona tili va Jismoniy tarbiya offline formatda o'tkaziladi.",
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-base font-medium text-navy-950 group-hover:text-navy-700 transition-colors">
          {question}
        </span>
        <span className="shrink-0 mt-0.5">
          {isOpen ? (
            <Minus className="w-5 h-5 text-gold-500" />
          ) : (
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          )}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-500 leading-relaxed pr-10">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* FAQ */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 mb-2">
              Ko&apos;p beriladigan savollar
            </h2>
            <p className="text-slate-500 mb-8">
              Olimpiada haqida eng muhim savollar va javoblar
            </p>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-card px-6 sm:px-8">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>

          {/* Contact sidebar */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-navy-950 mb-2">
              Bog&apos;lanish
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Savollaringiz bormi? Biz bilan bog&apos;laning
            </p>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
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
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
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
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {handle}
                    </a>
                  ))}
                </div>
              </div>

              <a
                href="https://t.me/Dilya0103"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-navy-950 text-white rounded-xl px-6 py-3.5 font-semibold text-sm hover:bg-navy-800 transition-colors"
              >
                <Send className="w-4 h-4" />
                Telegram orqali yozing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
