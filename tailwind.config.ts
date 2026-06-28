// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Warna brand SIPS — diambil dari config.py asli
      colors: {
        brand: {
          primary: "#7774E7",
          info: "#0F9AEE",
          success: "#37C936",
          danger: "#FF3C7E",
          warning: "#FFCC00",
          border: "#E6ECF5",
          text: "#72777A",
          "text-dark": "#313435",
          "sidebar-bg": "#FFFFFF",
          "content-bg": "#F9FAFB",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;

/* ─────────────────────────────────────────────────────────────────────────── */
/* next.config.ts                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
// import type { NextConfig } from "next";
//
// const nextConfig: NextConfig = {
//   experimental: {
//     serverComponentsExternalPackages: ["docxtemplater", "pizzip"],
//   },
//   // Blob storage untuk file .docx
//   images: {
//     domains: ["public.blob.vercel-storage.com"],
//   },
// };
//
// export default nextConfig;
