"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrophyIcon } from "@/components/ui/Icon3D";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function ResultsPreview() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-navy-950 section-heading">
            Natijalar
          </h2>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Olimpiada natijalari va reyting jadvali
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative bg-slate-50 rounded-2xl border border-slate-200 p-10 sm:p-14 text-center overflow-hidden group hover:border-gold-500/20 transition-all duration-500">
            {/* Animated gradient border glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-500/5 via-gold-500/10 to-gold-500/5" />
            </div>

            {/* Trophy with glow */}
            <div className="relative inline-block mb-6">
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gold-500/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrophyIcon className="w-8 h-8" />
                </motion.div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-navy-950 mb-3 relative">
              Natijalar tez orada e&apos;lon qilinadi
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto relative">
              Olimpiada yakunlangandan so&apos;ng natijalar ushbu sahifada chop etiladi. Hozircha ro&apos;yxatdan o&apos;ting va tayyorgarlik ko&apos;ring.
            </p>
            <Link href="/results" className="relative">
              <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Natijalar sahifasi
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
