"use client";

import { cn } from "@/lib/utils";

interface QuestionNavProps {
  total: number;
  current: number;
  answeredQuestions: Set<number>;
  onNavigate: (num: number) => void;
}

export function QuestionNav({
  total,
  current,
  answeredQuestions,
  onNavigate,
}: QuestionNavProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Array.from({ length: total }, (_, i) => i + 1).map((num) => {
        const isAnswered = answeredQuestions.has(num);
        const isCurrent = num === current;

        return (
          <button
            key={num}
            onClick={() => onNavigate(num)}
            className={cn(
              "w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-mono font-medium transition-all",
              isCurrent
                ? "bg-gold-500 text-green-900 ring-2 ring-gold-400/50 scale-110"
                : isAnswered
                  ? "bg-green-600/40 text-green-200 border border-green-500/30"
                  : "bg-white/5 text-white/40 border border-white/10 hover:border-white/20"
            )}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
