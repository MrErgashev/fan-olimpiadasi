"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "gold" | "blue" | "light";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
  theme = "gold",
}: ModalProps) {
  const isBlue = theme === "blue";
  const isLight = theme === "light";
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn("absolute inset-0", isLight ? "bg-black/40 backdrop-blur-sm" : "bg-black/70 backdrop-blur-xl")}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "max-h-[90vh] overflow-y-auto",
              isLight
                ? "relative bg-white border border-slate-200 rounded-card p-6 w-full shadow-2xl shadow-black/10"
                : isBlue
                  ? "relative glass-blue-strong border border-primary-500/20 rounded-card p-6 w-full shadow-2xl shadow-black/40"
                  : "relative glass-strong gold-border rounded-card p-6 w-full shadow-2xl shadow-black/40",
              {
                "max-w-sm": size === "sm",
                "max-w-md": size === "md",
                "max-w-lg": size === "lg",
                "max-w-xl": size === "xl",
              },
              className
            )}
          >
            {/* Accent line at top */}
            <div className={cn("absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent to-transparent", isLight ? "via-primary-500/40" : isBlue ? "via-primary-500/60" : "via-gold-500/60")} />

            {title && (
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn("text-xl font-display font-semibold", isLight ? "text-primary-600" : isBlue ? "text-primary-400" : "text-gold-400")}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className={cn("p-2 rounded-xl transition-all duration-200 hover:scale-110", isLight ? "hover:bg-slate-100" : "hover:bg-white/10")}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
