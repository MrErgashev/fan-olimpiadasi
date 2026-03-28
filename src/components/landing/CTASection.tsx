"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-navy-950 py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gold-500/[0.04] blur-[120px]" />

      <div className="relative max-w-container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Olimpiadaga tayyormisiz?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-lg mx-auto">
            Hoziroq ro&apos;yxatdan o&apos;ting va o&apos;z bilimingizni sinab ko&apos;ring.
            Katta sovg&apos;alar sizni kutmoqda!
          </p>
          <Link href="/register">
            <Button variant="premium" size="xl">
              RO&apos;YXATDAN O&apos;TISH
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
