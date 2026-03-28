import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1628",
          900: "#0f1c34",
          800: "#1a2744",
          700: "#243555",
          600: "#2e4266",
          500: "#3d5a80",
          400: "#5b7aa5",
        },
        gold: {
          600: "#b8922e",
          500: "#d4a843",
          400: "#e8c36a",
          300: "#f0d68a",
          200: "#f5e5b0",
          100: "#faf3d8",
        },
        // Keep green for admin/student pages backward compat
        green: {
          900: "#062a1e",
          800: "#0a3d2a",
          700: "#0f5c3a",
          600: "#1a7a4e",
          500: "#22996a",
          400: "#2eb87e",
        },
        // App blue theme (admin/student)
        app: {
          dark: "#0a0e1a",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          red: "#ef4444",
          emerald: "#10b981",
          violet: "#8b5cf6",
          orange: "#f97316",
          pink: "#ec4899",
          purple: "#a855f7",
          teal: "#14b8a6",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        "3xl": "24px",
        "4xl": "32px",
      },
      letterSpacing: {
        "ultra-wide": "0.3em",
        "premium": "0.15em",
      },
      maxWidth: {
        container: "1280px",
        "container-lg": "1400px",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        "glow-gold":
          "0 0 20px rgba(212, 168, 67, 0.15), 0 0 60px rgba(212, 168, 67, 0.05)",
        "glow-gold-lg":
          "0 0 30px rgba(212, 168, 67, 0.25), 0 0 80px rgba(212, 168, 67, 0.1)",
        "glow-blue":
          "0 0 20px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.08)",
        "glow-blue-lg":
          "0 0 30px rgba(59, 130, 246, 0.3), 0 0 80px rgba(59, 130, 246, 0.12)",
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
        "card-dark": "0 4px 16px rgba(0,0,0,0.3)",
        "premium": "0 8px 30px rgba(212, 168, 67, 0.2), 0 0 60px rgba(212, 168, 67, 0.08)",
        "inner-gold": "inset 0 1px 0 rgba(212, 168, 67, 0.1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "count-flip": {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(-90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(212,168,67,0)" },
          "50%": { boxShadow: "0 0 20px rgba(212,168,67,0.15), 0 0 40px rgba(212,168,67,0.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "breathing-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,168,67,0.2), 0 0 60px rgba(212,168,67,0.05)" },
          "50%": { boxShadow: "0 0 30px rgba(212,168,67,0.35), 0 0 80px rgba(212,168,67,0.12)" },
        },
        "border-rotate": {
          "0%": { "--border-angle": "0deg" },
          "100%": { "--border-angle": "360deg" },
        },
        "scroll-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "breathing-glow": "breathing-glow 3s ease-in-out infinite",
        "scroll-bounce": "scroll-bounce 2s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
