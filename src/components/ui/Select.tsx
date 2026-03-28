"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  variant?: "light" | "dark";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, variant = "light", ...props }, ref) => {
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
        <div className="relative group">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-3 border rounded-xl appearance-none transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50",
              isLight
                ? "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                : "bg-green-800/60 border-white/10 text-white hover:border-white/20 focus:bg-green-800/80",
              error
                ? "border-red-400"
                : "",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className={isLight ? "text-slate-400" : "bg-green-800 text-gray-400"}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className={isLight ? "" : "bg-green-800"}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180",
            isLight ? "text-slate-400" : "text-gray-400"
          )} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
