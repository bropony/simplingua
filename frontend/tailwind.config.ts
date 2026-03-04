import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        simplingua: {
          primary: "#2563eb",
          secondary: "#7c3aed",
          accent: "#db2777",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["Fira Code", "monospace"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};
