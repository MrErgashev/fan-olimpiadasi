"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Tepaga qaytish"
      className={`fixed bottom-6 right-6 z-[100] p-3 rounded-2xl bg-[#0a3d2a] text-[#e8c36a] shadow-lg shadow-black/25 border border-white/10 hover:bg-[#0f5c3a] hover:text-[#f0d080] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
}
