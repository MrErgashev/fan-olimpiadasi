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
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 group relative disabled:cursor-not-allowed disabled:opacity-70",
        selected
          ? isLight
            ? "border-primary-300 bg-primary-50 ring-2 ring-primary-200 shadow-lg shadow-primary-100/70"
            : "border-primary-500/50 bg-primary-500/15 ring-2 ring-primary-500/20 shadow-lg shadow-primary-500/5"
          : isLight
            ? "border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50 hover:-translate-y-0.5 shadow-sm"
            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold shrink-0 transition-all duration-200",
            selected
              ? "bg-gradient-to-r from-primary-500 to-accent-cyan text-white shadow-glow-blue"
              : isLight
                ? "bg-slate-100 text-slate-600 group-hover:bg-primary-50"
                : "bg-white/10 text-white/70 group-hover:bg-white/15"
          )}
        >
          {label}
        </span>
        <div className="flex-1 min-w-0 pt-1.5">
          <p
            className={cn(
              "text-base sm:text-lg break-words leading-relaxed",
              isLight ? "text-slate-800" : "text-white/90"
            )}
          >
            {text}
          </p>
          {imageUrl && (
            <div
              className={cn(
                "mt-3 rounded-xl overflow-hidden inline-block",
                isLight ? "bg-slate-50 border border-slate-200" : "bg-white/5"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`Variant ${label}`}
                className="max-h-48 object-contain"
              />
            </div>
          )}
        </div>

        {/* Checkmark */}
        {selected && (
          <div className="shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}
