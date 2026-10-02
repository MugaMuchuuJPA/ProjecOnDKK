import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dragao: {
          red: "#C8102E",
          redHover: "#A00C23",
          black: "#111111",
          white: "#FFFFFF",
          gray: "#F4F4F6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
