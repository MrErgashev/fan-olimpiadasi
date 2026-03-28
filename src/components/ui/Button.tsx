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
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out rounded-xl",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
          "active:scale-[0.98]",
          {
            // Primary — blue gradient CTA
            "bg-gradient-to-r from-primary-600 to-accent-cyan text-white hover:brightness-110 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5":
              variant === "primary",
            // Premium — blue with animated glow
            "bg-gradient-to-r from-primary-600 to-accent-cyan text-white font-bold shine-sweep hover:brightness-110 hover:shadow-[0_0_30px_rgba(59,130,246,0.3),0_8px_30px_rgba(59,130,246,0.2)] hover:-translate-y-0.5":
              variant === "premium",
            // Secondary — navy solid
            "bg-navy-800 text-white hover:bg-navy-700 border border-navy-600/50":
              variant === "secondary",
            // Outline — border only
            "bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50":
              variant === "outline",
            // Ghost — minimal
            "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100":
              variant === "ghost",
            // Danger
            "bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50":
              variant === "danger",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-3.5 text-lg": size === "lg",
            "px-10 py-4 text-lg rounded-2xl": size === "xl",
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
