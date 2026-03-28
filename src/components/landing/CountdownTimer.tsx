"use client";

import { useEffect, useState, useRef } from "react";
import { OLYMPIAD_DATE } from "@/lib/constants";

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
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 150);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        isFlipping
          ? "opacity-0 -translate-y-2 scale-95"
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {displayValue}
    </span>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const digits = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="glass-strong gold-border rounded-2xl px-5 py-4 sm:px-8 sm:py-6 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] hover:glow-gold transition-shadow duration-500">
        <div className="flex justify-center gap-0.5">
          {digits.split("").map((digit, i) => (
            <span
              key={i}
              className="text-3xl sm:text-5xl md:text-6xl font-mono font-black text-gold-400 text-glow-gold tabular-nums"
            >
              <AnimatedDigit value={digit} />
            </span>
          ))}
        </div>
      </div>
      <span className="mt-3 text-xs sm:text-sm text-white/30 uppercase tracking-[0.2em] font-medium">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex items-center pb-8">
      <span className="text-3xl sm:text-4xl text-gold-500/30 animate-pulse font-mono font-bold">
        :
      </span>
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
            <TimeBlock value={0} label={label} />
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
          <TimeBlock value={block.value} label={block.label} />
          {i < 3 && <Separator />}
        </div>
      ))}
    </div>
  );
}
