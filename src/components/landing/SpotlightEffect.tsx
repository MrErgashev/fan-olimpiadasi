"use client";

import { useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect } from "react";

interface SpotlightEffectProps {
  containerRef: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
}

export function SpotlightEffect({ containerRef, disabled = false }: SpotlightEffectProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - 300);
      mouseY.set(e.clientY - rect.top - 300);
    };

    container.addEventListener("mousemove", onMouseMove);
    return () => container.removeEventListener("mousemove", onMouseMove);
  }, [disabled, containerRef, mouseX, mouseY]);

  if (disabled) return null;

  return (
    <motion.div
      className="absolute pointer-events-none w-[600px] h-[600px] rounded-full opacity-0 md:opacity-100"
      style={{
        x: springX,
        y: springY,
        background:
          "radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
