import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "gold";
  hover?: boolean;
}

export function Card({
  className,
  variant = "glass",
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card p-6",
        {
          glass: variant === "glass",
          "bg-green-800 border border-white/10": variant === "solid",
          "glass gold-border": variant === "gold",
        },
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
