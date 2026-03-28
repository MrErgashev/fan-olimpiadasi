"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-button focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "gradient-btn text-white hover:shadow-lg hover:shadow-gold-500/20 hover:-translate-y-0.5 active:translate-y-0":
              variant === "primary",
            "bg-green-700 text-white hover:bg-green-600 border border-white/10":
              variant === "secondary",
            "bg-transparent border border-gold-500/40 text-gold-400 hover:bg-gold-500/10":
              variant === "outline",
            "bg-transparent text-gray-200 hover:text-white hover:bg-white/5":
              variant === "ghost",
            "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-8 py-3.5 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
