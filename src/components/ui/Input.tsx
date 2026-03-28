"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  variant?: "light" | "dark";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, variant = "light", ...props }, ref) => {
    const isLight = variant === "light";

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium",
              isLight ? "text-slate-700" : "text-gray-200"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              isLight ? "text-slate-400" : "text-gold-400"
            )}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-3 border rounded-xl transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50",
              isLight
                ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                : "bg-green-800/60 border-white/10 text-white placeholder:text-gray-500 hover:border-white/20 focus:bg-green-800/80",
              error
                ? "border-red-400 focus:ring-red-500/30 focus:border-red-500/50"
                : "",
              icon && "pl-11",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
