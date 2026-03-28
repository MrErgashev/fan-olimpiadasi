"use client";

import { cn } from "@/lib/utils";

interface OptionButtonProps {
  label: string; // A, B, C, D
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
        "w-full text-left p-4 rounded-card border transition-all duration-200 group",
        selected
          ? "border-gold-500/60 bg-gold-500/10 ring-1 ring-gold-500/30"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 transition-colors",
            selected
              ? "bg-gold-500 text-green-900"
              : "bg-green-700/50 text-white/70 group-hover:bg-green-600/50"
          )}
        >
          {label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white/90 text-sm sm:text-base break-words">
            {text}
          </p>
          {imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden bg-white/5 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`Variant ${label}`}
                className="max-h-40 object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
