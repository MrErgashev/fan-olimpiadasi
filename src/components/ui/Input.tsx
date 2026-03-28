"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-3 bg-green-800/60 border rounded-xl text-white placeholder:text-gray-500 transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 focus:bg-green-800/80",
              "focus:shadow-[0_0_0_3px_rgba(212,168,67,0.1)]",
              error
                ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50"
                : "border-white/10 hover:border-white/20",
              icon && "pl-11",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
