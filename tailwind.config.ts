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
        primary: {
          DEFAULT: "#2878E8",
          hover: "#1D67D2",
          light: "#EAF2FD",
          subtle: "#8ABEFF",
        },
        navy: {
          DEFAULT: "#14233D",
          dark: "#0D1829",
          light: "#1E3357",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F5F7FA",
          card: "#FFFFFF",
          muted: "#EEF2F6",
        },
        text: {
          primary: "#17243B",
          secondary: "#68758A",
          muted: "#9AA5B6",
        },
        border: {
          DEFAULT: "#D8DEE8",
          subtle: "#E6EBF2",
        },
        status: {
          success: "#24865B",
          "success-light": "#E9F6F0",
          error: "#D64545",
          "error-light": "#FDF0F0",
          warning: "#D97706",
          "warning-light": "#FEF3C7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 2px 8px -2px rgba(20, 35, 61, 0.05), 0 1px 4px -1px rgba(20, 35, 61, 0.03)",
        card: "0 8px 24px -6px rgba(20, 35, 61, 0.07), 0 2px 6px -2px rgba(20, 35, 61, 0.04)",
        timer: "0 14px 40px -10px rgba(40, 120, 232, 0.15), 0 4px 12px -3px rgba(20, 35, 61, 0.06)",
        float: "0 20px 35px -10px rgba(20, 35, 61, 0.12), 0 8px 16px -6px rgba(20, 35, 61, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
