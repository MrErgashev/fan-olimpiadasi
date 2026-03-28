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
        green: {
          900: "#062a1e",
          800: "#0a3d2a",
          700: "#0f5c3a",
          600: "#1a7a4e",
          500: "#22996a",
          400: "#2eb87e",
        },
        gold: {
          600: "#b8922e",
          500: "#d4a843",
          400: "#e8c36a",
          300: "#f0d68a",
          200: "#f5e5b0",
        },
        dark: {
          900: "#111111",
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
      maxWidth: {
        container: "1280px",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        "glow-gold":
          "0 0 20px rgba(212, 168, 67, 0.15), 0 0 60px rgba(212, 168, 67, 0.05)",
        "glow-green":
          "0 0 20px rgba(34, 153, 106, 0.15), 0 0 60px rgba(34, 153, 106, 0.05)",
        "glow-gold-lg":
          "0 0 30px rgba(212, 168, 67, 0.25), 0 0 80px rgba(212, 168, 67, 0.1)",
        "inner-gold": "inset 0 1px 0 rgba(212, 168, 67, 0.1)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 168, 67, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 168, 67, 0.6)" },
        },
        "float-up": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        countdown: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(212,168,67,0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 40px rgba(212,168,67,0.4), 0 0 80px rgba(212,168,67,0.1)",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shine: {
          "0%": { left: "-100%" },
          "100%": { left: "200%" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float-up": "float-up 3s ease-in-out infinite",
        countdown: "countdown 1s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shine: "shine 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
