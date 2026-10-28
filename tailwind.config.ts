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
        paper: "#f4f2ed",
        sand: "#e9e5db",
        ink: {
          50: "#f7f6f3",
          100: "#edebe5",
          200: "#e0ddd4",
          300: "#cbc6ba",
          400: "#a7a094",
          500: "#7c766b",
          600: "#5c574e",
          700: "#423e37",
          800: "#2a2823",
          900: "#171613",
          950: "#0d0c0a",
        },
        accent: {
          50: "#fdf2f3",
          100: "#fbe0e2",
          200: "#f7c4c8",
          300: "#ef9ba1",
          400: "#e5636c",
          500: "#d63a45",
          600: "#c8102e",
          700: "#a60d26",
          800: "#8a0f23",
          900: "#751123",
        },
      },
      fontFamily: {
        sans: [
          '"Work Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(23, 22, 19, 0.04)",
        lift: "0 18px 40px -24px rgba(23, 22, 19, 0.35)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
