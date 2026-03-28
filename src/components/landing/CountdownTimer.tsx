"use client";

import { useEffect, useState } from "react";
import { OLYMPIAD_DATE } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = OLYMPIAD_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function AnimatedDigit({ value }: { value: string }) {
  return (
    <div className="relative inline-flex justify-center w-[0.6em]" style={{ perspective: "200px" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ rotateX: -80, opacity: 0, filter: "blur(2px)" }}
          animate={{ rotateX: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ rotateX: 80, opacity: 0, filter: "blur(2px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ transformOrigin: "bottom", backfaceVisibility: "hidden" }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function TimeBlock({
  value,
  label,
  isSeconds = false,
}: {
  value: number;
  label: string;
  isSeconds?: boolean;
}) {
  const digits = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative rounded-2xl px-5 py-4 sm:px-7 sm:py-5 min-w-[80px] sm:min-w-[100px]",
          "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          isSeconds && "animate-glow-pulse"
        )}
      >
        {/* Gold top-border glow */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

        <div className="flex justify-center gap-0.5">
          {digits.split("").map((digit, i) => (
            <span
              key={i}
              className="text-3xl sm:text-4xl md:text-5xl font-mono font-black text-white tabular-nums"
            >
              <AnimatedDigit value={digit} />
            </span>
          ))}
        </div>
      </div>
      <span className="mt-2.5 text-[10px] sm:text-xs text-white/30 uppercase tracking-[0.2em] font-medium">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 pb-7">
      <motion.span
        className="block w-1.5 h-1.5 rounded-full bg-gold-500/40"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="block w-1.5 h-1.5 rounded-full bg-gold-500/40"
        animate={{ opacity: [0.8, 0.4, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(calcTimeLeft());
    const interval = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {["Kun", "Soat", "Daqiqa", "Soniya"].map((label, i) => (
          <div key={label} className="flex items-center gap-3 sm:gap-4">
            <TimeBlock value={0} label={label} isSeconds={i === 3} />
            {i < 3 && <Separator />}
          </div>
        ))}
      </div>
    );
  }

  const blocks = [
    { value: time.days, label: "Kun" },
    { value: time.hours, label: "Soat" },
    { value: time.minutes, label: "Daqiqa" },
    { value: time.seconds, label: "Soniya" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center gap-3 sm:gap-4">
          <TimeBlock
            value={block.value}
            label={block.label}
            isSeconds={i === 3}
          />
          {i < 3 && <Separator />}
        </div>
      ))}
    </div>
  );
}
