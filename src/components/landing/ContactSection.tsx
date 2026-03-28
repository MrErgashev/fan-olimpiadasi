"use client";

import { Card } from "@/components/ui/Card";
import { CONTACT_INFO } from "@/lib/constants";
import { MapPin, Send, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function ContactSection() {
  return (
    <section id="kontakt" className="py-20 sm:py-28 relative">
      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient">
            Bog&apos;lanish
          </h2>
          <p className="mt-4 text-white/50">
            Savollaringiz bormi? Biz bilan bog&apos;laning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card variant="glass" className="h-full min-h-[280px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gold-400 mx-auto mb-4" />
                <p className="text-white/70 font-medium">
                  {CONTACT_INFO.address}
                </p>
                <p className="text-white/40 text-sm mt-2">
                  Yandex Xarita
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Card variant="glass" className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-700/30 border border-green-500/20">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Manzil</p>
                <p className="text-white font-medium">
                  {CONTACT_INFO.address}
                </p>
              </div>
            </Card>

            <Card variant="glass" className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/20">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Telegram</p>
                <div className="flex gap-3">
                  {CONTACT_INFO.telegram.map((handle) => (
                    <a
                      key={handle}
                      href={`https://t.me/${handle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      {handle}
                    </a>
                  ))}
                </div>
              </div>
            </Card>

            <Card variant="glass" className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gold-500/20 border border-gold-500/20">
                <Phone className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Qo&apos;ng&apos;iroq qilish</p>
                <p className="text-white font-medium">
                  Telegram orqali bog&apos;laning
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
