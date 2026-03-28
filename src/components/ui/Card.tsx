import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "gold" | "glass-subtle" | "glass-strong" | "glass-gold" | "elevated" | "interactive" | "feature";
  hover?: boolean;
}

export function Card({
  className,
  variant = "glass",
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card p-6 sm:p-7 relative overflow-hidden",
        {
          // Legacy variants
          glass: variant === "glass",
          "bg-green-800 border border-white/10": variant === "solid",
          "glass gold-border": variant === "gold",
          // New glassmorphism tiers
          "glass-subtle": variant === "glass-subtle",
          "glass-strong": variant === "glass-strong",
          "glass-gold": variant === "glass-gold",
          // New premium variants
          "shadow-2xl shadow-black/20 glass": variant === "elevated",
          "glass border border-white/[0.08] hover:border-white/[0.15] hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer":
            variant === "interactive",
          "glass-strong p-8 sm:p-10 border border-white/[0.1] bg-gradient-to-br from-green-800/60 to-green-900/60":
            variant === "feature",
        },
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
