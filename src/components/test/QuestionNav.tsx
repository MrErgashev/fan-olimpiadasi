"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuestionNavProps {
  total: number;
  current: number;
  answeredQuestions: Set<number>;
  onNavigate: (num: number) => void;
  theme?: "dark" | "light";
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
}

export function QuestionNav({
  total,
  current,
  answeredQuestions,
  onNavigate,
  theme = "dark",
  orientation = "horizontal",
  compact = false,
  className,
}: QuestionNavProps) {
  const isLight = theme === "light";
  const isVertical = orientation === "vertical";

  return (
    <div className="relative">
      {!isVertical && (
        <>
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
        </>
      )}

      <div
        className={cn(
          isVertical
            ? "flex flex-col gap-2 overflow-y-auto"
            : "flex gap-1.5 justify-center overflow-x-auto px-2 sm:flex-wrap sm:overflow-visible scrollbar-none",
          className
        )}
      >
        {Array.from({ length: total }, (_, i) => i + 1).map((num) => {
          const isAnswered = answeredQuestions.has(num);
          const isCurrent = num === current;

          return (
            <button
              key={num}
              onClick={() => onNavigate(num)}
              aria-label={`${num}-savolga o'tish`}
              className={cn(
                "shrink-0 font-mono font-medium transition-all duration-200 flex items-center",
                isVertical
                  ? compact
                    ? "w-full min-h-10 rounded-xl px-3 py-2 text-sm justify-between"
                    : "w-full min-h-11 rounded-2xl px-4 py-2.5 text-sm justify-between"
                  : compact
                    ? "w-9 h-9 rounded-xl text-sm justify-center"
                    : "w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm justify-center",
                isCurrent
                  ? cn(
                      "bg-gradient-to-r from-primary-500 to-accent-cyan text-white ring-2 ring-primary-400/50 shadow-glow-blue font-bold",
                      isVertical ? "scale-100" : "scale-110"
                    )
                  : isAnswered
                    ? isLight
                      ? "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                      : "bg-primary-600/40 text-primary-200 border border-primary-500/30"
                    : isLight
                      ? "bg-white text-slate-500 border border-slate-200 hover:border-primary-200 hover:bg-primary-50/60"
                      : "bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
              )}
            >
              {isVertical ? (
                <>
                  <span>{num}-savol</span>
                  {isAnswered && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
                      Aktiv
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isLight ? "bg-slate-300" : "bg-white/25"
                      )}
                    />
                  )}
                </>
              ) : isAnswered && !isCurrent ? (
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
