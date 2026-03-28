"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "premium";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out rounded-button",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
          "active:scale-[0.98]",
          {
            // Primary
            "gradient-btn text-white hover:shadow-lg hover:shadow-gold-500/25 hover:-translate-y-0.5 hover:scale-[1.02]":
              variant === "primary",
            // Premium — animated gradient
            "gradient-btn-premium animate-gradient text-white font-semibold hover:shadow-xl hover:shadow-gold-500/30 hover:-translate-y-1 hover:scale-[1.02]":
              variant === "premium",
            // Secondary
            "bg-green-700 text-white hover:bg-green-600 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-green-500/10":
              variant === "secondary",
            // Outline
            "bg-transparent border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/60 hover:shadow-lg hover:shadow-gold-500/10":
              variant === "outline",
            // Ghost
            "bg-transparent text-gray-200 hover:text-white hover:bg-white/5":
              variant === "ghost",
            // Danger
            "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-8 py-3.5 text-lg": size === "lg",
            "px-12 py-5 text-xl rounded-2xl": size === "xl",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Yuklanmoqda...</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
