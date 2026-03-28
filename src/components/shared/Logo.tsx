import { cn } from "@/lib/utils";
import { OrientalLogo } from "@/components/icons/OrientalLogo";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "light" | "dark";
}

export function Logo({ size = "md", className, variant = "dark" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 transition-transform duration-300 hover:scale-105",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan",
          {
            "w-8 h-8": size === "sm",
            "w-10 h-10": size === "md",
            "w-14 h-14 rounded-2xl": size === "lg",
            "w-20 h-20 rounded-2xl": size === "xl",
          }
        )}
      >
        <OrientalLogo
          className={cn("text-white", {
            "w-5 h-5": size === "sm",
            "w-6 h-6": size === "md",
            "w-8 h-8": size === "lg",
            "w-12 h-12": size === "xl",
          })}
        />
      </div>
      <div className="flex flex-col">
        <span
          className={cn("font-display font-bold leading-tight", {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-xl": size === "lg",
            "text-2xl": size === "xl",
          }, isLight ? "text-navy-950" : "text-white")}
        >
          ORIENTAL
        </span>
        <span
          className={cn("leading-tight tracking-wider", {
            "text-[10px]": size === "sm",
            "text-xs": size === "md",
            "text-sm": size === "lg",
            "text-base": size === "xl",
          }, isLight ? "text-slate-500" : "text-white/60")}
        >
          UNIVERSITETI
        </span>
      </div>
    </div>
  );
}
