"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
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
        <div className="relative group">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-3 bg-green-800/60 border rounded-xl text-white appearance-none transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/50 focus:bg-green-800/80",
              "focus:shadow-[0_0_0_3px_rgba(212,168,67,0.1)]",
              error
                ? "border-red-500/50"
                : "border-white/10 hover:border-white/20",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="bg-green-800 text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-green-800"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
