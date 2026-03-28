"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function ResultsPreview() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950">
            Natijalar
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Olimpiada natijalari va reyting jadvali
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-gold-500" />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-3">
              Natijalar tez orada e&apos;lon qilinadi
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Olimpiada yakunlangandan so&apos;ng natijalar ushbu sahifada chop etiladi. Hozircha ro&apos;yxatdan o&apos;ting va tayyorgarlik ko&apos;ring.
            </p>
            <Link href="/results">
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
