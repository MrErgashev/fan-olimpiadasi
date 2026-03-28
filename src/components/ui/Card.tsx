import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "gold" | "glass-subtle" | "glass-strong" | "glass-gold" | "elevated" | "interactive" | "feature" | "light" | "dark" | "outline";
  hover?: boolean;
}

export function Card({
  className,
  variant = "light",
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl relative overflow-hidden",
        {
          // NEW premium variants
          "bg-white shadow-card border border-slate-100": variant === "light",
          "bg-navy-800/90 backdrop-blur-xl border border-white/10 text-white": variant === "dark",
          "bg-white border border-slate-200": variant === "outline",
          // Legacy variants (admin/student pages)
          glass: variant === "glass",
          "bg-green-800 border border-white/10": variant === "solid",
          "glass gold-border": variant === "gold",
          "glass-subtle": variant === "glass-subtle",
          "glass-strong": variant === "glass-strong",
          "glass-gold": variant === "glass-gold",
          "shadow-2xl shadow-black/20 glass": variant === "elevated",
          "glass border border-white/[0.08] hover:border-white/[0.15] hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer":
            variant === "interactive",
          "glass-strong p-8 sm:p-10 border border-white/[0.1] bg-gradient-to-br from-green-800/60 to-green-900/60":
            variant === "feature",
        },
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
