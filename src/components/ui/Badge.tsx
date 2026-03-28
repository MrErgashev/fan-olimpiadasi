import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "gold" | "info";
  size?: "sm" | "md" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        {
          // Sizes
          "px-2.5 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-sm": size === "md",
          "px-4 py-1.5 text-base": size === "lg",
        },
        {
          // Variants
          "bg-green-700/50 text-green-300 border-green-500/30":
            variant === "default",
          "bg-emerald-500/20 text-emerald-400 border-emerald-500/30":
            variant === "success",
          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30":
            variant === "warning",
          "bg-red-500/20 text-red-400 border-red-500/30":
            variant === "error",
          "bg-gold-500/20 text-gold-400 border-gold-500/30":
            variant === "gold",
          "bg-blue-500/20 text-blue-400 border-blue-500/30":
            variant === "info",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
