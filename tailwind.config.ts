import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lulaRed: "#BD0703",
        lulaYellow: "#FFD300",
        brasilGreen: "#006622",
        brasilBlue: "#00629E",
        deepBlue: "#00629E",
        paper: "#FEFCCC",
        ink: "#1E1D1D"
      },
      boxShadow: {
        soft: "0 18px 48px rgba(30, 29, 29, 0.12)",
        poster: "8px 8px 0 rgba(30, 29, 29, 0.95)"
      }
    }
  },
  plugins: []
};

export default config;
