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
        "inline-flex items-center rounded-full font-medium border",
        {
          "px-2.5 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-sm": size === "md",
          "px-4 py-1.5 text-base": size === "lg",
        },
        {
          "bg-slate-100 text-slate-600 border-slate-200":
            variant === "default",
          "bg-emerald-50 text-emerald-700 border-emerald-200":
            variant === "success",
          "bg-amber-50 text-amber-700 border-amber-200":
            variant === "warning",
          "bg-red-50 text-red-700 border-red-200":
            variant === "error",
          "bg-gold-100 text-gold-600 border-gold-200":
            variant === "gold",
          "bg-blue-50 text-blue-700 border-blue-200":
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
