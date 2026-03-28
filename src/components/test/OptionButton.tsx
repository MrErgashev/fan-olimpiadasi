"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OptionButtonProps {
  label: string;
  text: string;
  imageUrl?: string | null;
  selected: boolean;
  onClick: () => void;
}

export function OptionButton({
  label,
  text,
  imageUrl,
  selected,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 group relative",
        selected
          ? "border-gold-500/50 bg-gold-500/15 ring-2 ring-gold-500/20 shadow-lg shadow-gold-500/5"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold shrink-0 transition-all duration-200",
            selected
              ? "bg-gold-500 text-green-900 shadow-glow-gold"
              : "bg-green-700/50 text-white/70 group-hover:bg-green-600/50"
          )}
        >
          {label}
        </span>
        <div className="flex-1 min-w-0 pt-1.5">
          <p className="text-white/90 text-base sm:text-lg break-words leading-relaxed">
            {text}
          </p>
          {imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden bg-white/5 inline-block">
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
          <div className="shrink-0 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-green-900" />
          </div>
        )}
      </div>
    </button>
  );
}
