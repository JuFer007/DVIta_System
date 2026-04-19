/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#FBF3EE",
          100: "#F4DDD0",
          200: "#E8BFAA",
          300: "#D99B6E",
          400: "#C97B45",
          500: "#B8622A",
          600: "#9A5020",
          700: "#7A3D14",
          800: "#5C2E0F",
          900: "#3D1F0A",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
 