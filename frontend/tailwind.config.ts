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
    },
  },
  plugins: [],
};

export default config;
