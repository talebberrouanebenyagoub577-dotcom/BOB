import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1628",
          light: "#152A45",
        },
        gold: {
          DEFAULT: "#C9A24D",
          light: "#D4B465",
          pale: "#F5ECD8",
        },
        cream: {
          DEFAULT: "#F6F4EF",
        },
        trust: {
          DEFAULT: "#15803D",
          pale: "#DCFCE7",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      screens: {
        xs: "375px",
      },
      keyframes: {
        "thank-you-check-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "55%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "thank-you-check-draw": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "thank-you-pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 162, 77, 0.45)" },
          "50%": { boxShadow: "0 0 0 14px rgba(201, 162, 77, 0)" },
        },
      },
      animation: {
        "thank-you-check-pop": "thank-you-check-pop 0.65s cubic-bezier(0.34, 1.45, 0.64, 1) both",
        "thank-you-check-draw": "thank-you-check-draw 0.45s ease-out 0.35s forwards",
        "thank-you-pulse-soft": "thank-you-pulse-soft 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
