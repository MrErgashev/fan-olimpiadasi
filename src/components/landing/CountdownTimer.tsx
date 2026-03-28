"use client";

import { useEffect, useState } from "react";
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

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass gold-border rounded-xl px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]">
        <span className="block text-2xl sm:text-4xl font-mono font-bold text-gold-400 text-center tabular-nums">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm text-white/50 uppercase tracking-wider">
        {label}
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
      <div className="flex gap-3 sm:gap-4 justify-center">
        {["Kun", "Soat", "Daqiqa", "Soniya"].map((label) => (
          <TimeBlock key={label} value={0} label={label} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      <TimeBlock value={time.days} label="Kun" />
      <TimeBlock value={time.hours} label="Soat" />
      <TimeBlock value={time.minutes} label="Daqiqa" />
      <TimeBlock value={time.seconds} label="Soniya" />
    </div>
  );
}
