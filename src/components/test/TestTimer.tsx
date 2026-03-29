"use client";

import { cn } from "@/lib/utils";
import { formatTimer } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TestTimerProps {
  seconds: number;
  isWarning: boolean;
  isCritical: boolean;
  theme?: "dark" | "light";
}

export function TestTimer({
  seconds,
  isWarning,
  isCritical,
  theme = "dark",
}: TestTimerProps) {
  const isLight = theme === "light";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-xl sm:text-2xl font-black transition-all duration-300",
        isCritical
          ? isLight
            ? "bg-red-50 text-red-600 border border-red-200 animate-countdown shadow-sm"
            : "bg-red-500/20 text-red-400 border border-red-500/40 animate-countdown shadow-lg shadow-red-500/20"
          : isWarning
            ? isLight
              ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
            : isLight
              ? "bg-white text-primary-700 border border-primary-200 shadow-sm"
              : "bg-primary-700/30 text-primary-300 border border-primary-500/20"
      )}
    >
      <Clock className={cn("w-5 h-5", isCritical && "animate-pulse")} />
      <span className={cn("tabular-nums", !isLight && "text-glow-gold")}>
        {formatTimer(seconds)}
      </span>
    </div>
  );
}
