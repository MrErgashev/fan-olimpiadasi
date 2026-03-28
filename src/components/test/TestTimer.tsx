"use client";

import { cn } from "@/lib/utils";
import { formatTimer } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TestTimerProps {
  seconds: number;
  isWarning: boolean;
  isCritical: boolean;
}

export function TestTimer({ seconds, isWarning, isCritical }: TestTimerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-button font-mono text-lg font-bold transition-colors",
        isCritical
          ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-countdown"
          : isWarning
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-green-700/30 text-green-300 border border-green-500/20"
      )}
    >
      <Clock className="w-4 h-4" />
      <span className="tabular-nums">{formatTimer(seconds)}</span>
    </div>
  );
}
