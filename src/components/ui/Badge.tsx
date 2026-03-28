import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "gold";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-green-700/50 text-green-300 border border-green-500/30":
            variant === "default",
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30":
            variant === "success",
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30":
            variant === "warning",
          "bg-red-500/20 text-red-400 border border-red-500/30":
            variant === "error",
          "bg-gold-500/20 text-gold-400 border border-gold-500/30":
            variant === "gold",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
