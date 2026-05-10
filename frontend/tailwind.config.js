/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        /** Extra-bubbly display for the main wordmark (rounder than Fredoka). */
        title: ['"Baloo 2"', '"Fredoka"', "system-ui", "sans-serif"],
        cute: ['"Fredoka"', "system-ui", "sans-serif"],
        sans: ['"Nunito"', "system-ui", "sans-serif"],
      },
      colors: {
        pond: {
          50: "#f0faf8",
          100: "#d9f2ec",
          200: "#b6e4d9",
          300: "#86cfbf",
          400: "#52b39e",
          500: "#339885",
          600: "#267a6b",
          700: "#226258",
          800: "#1f4f48",
          900: "#1c423d",
        },
        bill: {
          DEFAULT: "#f4a261",
          dark: "#e76f51",
        },
      },
      boxShadow: {
        card: "0 4px 24px -4px rgb(15 118 110 / 0.12), 0 8px 20px -8px rgb(244 114 182 / 0.08)",
        cute: "0 5px 0 rgb(34 98 88 / 0.22), 0 10px 28px -6px rgb(15 23 42 / 0.12)",
        "cute-sm": "0 3px 0 rgb(34 98 88 / 0.18), 0 6px 16px -4px rgb(15 23 42 / 0.1)",
      },
      keyframes: {
        // Inspired by the Gen-3 Pokemon "Tickle" move: a rapid horizontal
        // shimmy with anti-correlated scaleX/scaleY squash-and-stretch that
        // decays over the course of the animation.
        mallardWiggle: {
          "0%, 100%": { transform: "translateX(0) scaleX(1) scaleY(1)" },
          "8%":  { transform: "translateX(-4px) scaleX(1.16) scaleY(0.88)" },
          "16%": { transform: "translateX(4px)  scaleX(0.84) scaleY(1.12)" },
          "24%": { transform: "translateX(-4px) scaleX(1.16) scaleY(0.88)" },
          "32%": { transform: "translateX(4px)  scaleX(0.84) scaleY(1.12)" },
          "44%": { transform: "translateX(-3px) scaleX(1.12) scaleY(0.92)" },
          "56%": { transform: "translateX(3px)  scaleX(0.88) scaleY(1.08)" },
          "68%": { transform: "translateX(-2px) scaleX(1.08) scaleY(0.95)" },
          "80%": { transform: "translateX(2px)  scaleX(0.94) scaleY(1.04)" },
          "92%": { transform: "translateX(-1px) scaleX(1.02) scaleY(0.99)" },
        },
      },
      animation: {
        "mallard-wiggle": "mallardWiggle 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};
