"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CONTACT_INFO } from "@/lib/constants";
import { PinIcon, SendIcon, PhoneIcon } from "@/components/ui/Icon3D";
import { motion } from "framer-motion";

export function ContactSection() {
  return (
    <section id="kontakt" className="py-24 sm:py-32 lg:py-40 relative">
      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-gold-gradient">
            Bog&apos;lanish
          </h2>
          <div className="ornamental-line mt-6 mb-6" />
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto">
            Savollaringiz bormi? Biz bilan bog&apos;laning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              variant="glass-gold"
              className="h-full min-h-[300px] flex items-center justify-center rounded-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6 shadow-glow-gold">
                  <PinIcon className="w-10 h-10 text-green-900" />
                </div>
                <p className="text-white/70 font-medium text-lg mb-2">
                  {CONTACT_INFO.address}
                </p>
                <p className="text-white/30 text-sm">Yandex Xarita</p>
              </div>
            </Card>
          </motion.div>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <Card
              variant="glass"
              className="flex items-center gap-5 p-6 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl"
            >
              <div className="p-4 rounded-2xl bg-green-700/30 border border-green-500/20">
                <PinIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/40 mb-1">Manzil</p>
                <p className="text-white font-medium">
                  {CONTACT_INFO.address}
                </p>
              </div>
            </Card>

            <Card
              variant="glass"
              className="flex items-center gap-5 p-6 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl"
            >
              <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/20">
                <SendIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/40 mb-1">Telegram</p>
                <div className="flex flex-wrap gap-3">
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

            <Card
              variant="glass"
              className="flex items-center gap-5 p-6 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl"
            >
              <div className="p-4 rounded-2xl bg-gold-500/20 border border-gold-500/20">
                <PhoneIcon className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <p className="text-sm text-white/40 mb-1">
                  Qo&apos;ng&apos;iroq qilish
                </p>
                <p className="text-white font-medium">
                  Telegram orqali bog&apos;laning
                </p>
              </div>
            </Card>

            {/* CTA */}
            <a
              href="https://t.me/Dilya0103"
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-2"
            >
              <Button variant="outline" size="lg" className="w-full" icon={<SendIcon className="w-4 h-4" />}>
                Telegram orqali yozing
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
