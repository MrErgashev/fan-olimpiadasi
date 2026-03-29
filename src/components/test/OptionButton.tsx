"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OptionButtonProps {
  label: string;
  text: string;
  imageUrl?: string | null;
  selected: boolean;
  onClick: () => void;
  theme?: "dark" | "light";
  disabled?: boolean;
}

export function OptionButton({
  label,
  text,
  imageUrl,
  selected,
  onClick,
  theme = "dark",
  disabled = false,
}: OptionButtonProps) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 group relative disabled:cursor-not-allowed disabled:opacity-70 sm:px-4 sm:py-3.5",
        selected
          ? isLight
            ? "border-primary-300 bg-primary-50 ring-2 ring-primary-100 shadow-sm"
            : "border-primary-500/50 bg-primary-500/15 ring-2 ring-primary-500/20 shadow-lg shadow-primary-500/5"
          : isLight
            ? "border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50/80 shadow-sm"
            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 sm:h-9 sm:w-9",
            selected
              ? "bg-gradient-to-r from-primary-500 to-accent-cyan text-white shadow-glow-blue"
              : isLight
                ? "bg-slate-100 text-slate-600 group-hover:bg-primary-50"
                : "bg-white/10 text-white/70 group-hover:bg-white/15"
          )}
        >
          {label}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className={cn(
              "break-words whitespace-pre-line text-[15px] leading-6 sm:text-base sm:leading-6",
              isLight ? "text-slate-800" : "text-white/90"
            )}
          >
            {text}
          </p>
          {imageUrl && (
            <div
              className={cn(
                "mt-2.5 inline-block overflow-hidden rounded-xl",
                isLight ? "bg-slate-50 border border-slate-200" : "bg-white/5"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`Variant ${label}`}
                className="max-h-36 object-contain"
              />
            </div>
          )}
        </div>

        {selected && (
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}
