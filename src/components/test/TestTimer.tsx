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
        "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 font-mono text-lg font-bold transition-all duration-300 sm:px-4 sm:py-3 sm:text-xl",
        isCritical
          ? isLight
            ? "bg-red-50 text-red-600 border-red-200 animate-countdown shadow-sm"
            : "bg-red-500/20 text-red-400 border border-red-500/40 animate-countdown shadow-lg shadow-red-500/20"
          : isWarning
            ? isLight
              ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
            : isLight
              ? "bg-white text-primary-700 border-primary-200 shadow-sm"
              : "bg-primary-700/30 text-primary-300 border border-primary-500/20"
      )}
    >
      <Clock className={cn("h-4 w-4 sm:h-5 sm:w-5", isCritical && "animate-pulse")} />
      <span className={cn("tabular-nums", !isLight && "text-glow-gold")}>
        {formatTimer(seconds)}
      </span>
    </div>
  );
}
