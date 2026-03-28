"use client";

import { cn } from "@/lib/utils";
import { formatTimer } from "@/lib/utils";
import { ClockIcon } from "@/components/ui/Icon3D";

interface TestTimerProps {
  seconds: number;
  isWarning: boolean;
  isCritical: boolean;
}

export function TestTimer({ seconds, isWarning, isCritical }: TestTimerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-xl sm:text-2xl font-black transition-all duration-300",
        isCritical
          ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-countdown shadow-lg shadow-red-500/20"
          : isWarning
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
            : "bg-primary-700/30 text-primary-300 border border-primary-500/20"
      )}
    >
      <ClockIcon className={cn("w-5 h-5", isCritical && "animate-pulse")} />
      <span className="tabular-nums text-glow-gold">{formatTimer(seconds)}</span>
    </div>
  );
}
