import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F1B2D",
          light: "#1a2d47",
        },
        gold: {
          DEFAULT: "#C9962A",
          light: "#e0b444",
          pale: "#f5e8c0",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
