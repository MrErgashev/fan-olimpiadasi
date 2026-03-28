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
        },
        gold: {
          500: "#d4a843",
          400: "#e8c36a",
          300: "#f0d68a",
          200: "#f5e5b0",
        },
        dark: {
          900: "#111111",
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
      },
      maxWidth: {
        container: "1280px",
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
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float-up": "float-up 3s ease-in-out infinite",
        countdown: "countdown 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
