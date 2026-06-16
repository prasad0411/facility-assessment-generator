/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#1a2744",
          teal: "#0d9488",
          "teal-light": "#5eead4",
          slate: "#334155",
          muted: "#94a3b8",
          bg: "#f8fafc",
          card: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
