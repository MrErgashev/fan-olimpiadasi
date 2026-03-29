"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuestionNavProps {
  total: number;
  current: number;
  answeredQuestions: Set<number>;
  onNavigate: (num: number) => void;
  theme?: "dark" | "light";
}

export function QuestionNav({
  total,
  current,
  answeredQuestions,
  onNavigate,
  theme = "dark",
}: QuestionNavProps) {
  const isLight = theme === "light";

  return (
    <div className="relative">
      {/* Fade edges for scroll indication */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none sm:hidden",
          isLight
            ? "bg-gradient-to-r from-slate-50 to-transparent"
            : "bg-gradient-to-r from-app-dark to-transparent"
        )}
      />
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none sm:hidden",
          isLight
            ? "bg-gradient-to-l from-slate-50 to-transparent"
            : "bg-gradient-to-l from-app-dark to-transparent"
        )}
      />

      <div className="flex gap-1.5 justify-center overflow-x-auto px-2 sm:flex-wrap sm:overflow-visible scrollbar-none">
        {Array.from({ length: total }, (_, i) => i + 1).map((num) => {
          const isAnswered = answeredQuestions.has(num);
          const isCurrent = num === current;

          return (
            <button
              key={num}
              onClick={() => onNavigate(num)}
              className={cn(
                "shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm font-mono font-medium transition-all duration-200 flex items-center justify-center",
                isCurrent
                  ? "bg-gradient-to-r from-primary-500 to-accent-cyan text-white ring-2 ring-primary-400/50 scale-110 shadow-glow-blue font-bold"
                  : isAnswered
                    ? isLight
                      ? "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                      : "bg-primary-600/40 text-primary-200 border border-primary-500/30"
                    : isLight
                      ? "bg-white text-slate-500 border border-slate-200 hover:border-primary-200 hover:bg-primary-50/60"
                      : "bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
              )}
            >
              {isAnswered && !isCurrent ? (
                <Check className="w-4 h-4" />
              ) : (
                num
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
