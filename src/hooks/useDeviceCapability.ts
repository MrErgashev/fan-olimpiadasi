"use client";

import { useEffect, useState } from "react";

export function useDeviceCapability() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsMobile(mobileQuery.matches);
    setPrefersReducedMotion(motionQuery.matches);

    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    mobileQuery.addEventListener("change", onMobileChange);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      mobileQuery.removeEventListener("change", onMobileChange);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return { isMobile, prefersReducedMotion };
}
