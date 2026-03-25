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
        background: "#F9FBF9",
        sidebar: "#EBF2EB",
        hero: "#1B6331",
        card: "#F0F4EF",
        primary: "#1B6331", // Hero green
        accent: "#2E7D32",  // Accent green
        text: "#0A2E12",    // Dark text
        muted: "#556B55",   // Muted green-gray text
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
