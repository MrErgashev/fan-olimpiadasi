import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl gradient-gold",
          {
            "w-8 h-8": size === "sm",
            "w-10 h-10": size === "md",
            "w-14 h-14": size === "lg",
          }
        )}
      >
        <GraduationCap
          className={cn("text-green-900", {
            "w-5 h-5": size === "sm",
            "w-6 h-6": size === "md",
            "w-8 h-8": size === "lg",
          })}
        />
      </div>
      <div className="flex flex-col">
        <span
          className={cn("font-display font-bold text-gold-400 leading-tight", {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-xl": size === "lg",
          })}
        >
          ORIENTAL
        </span>
        <span
          className={cn("text-white/70 leading-tight", {
            "text-[10px]": size === "sm",
            "text-xs": size === "md",
            "text-sm": size === "lg",
          })}
        >
          UNIVERSITETI
        </span>
      </div>
    </div>
  );
}
