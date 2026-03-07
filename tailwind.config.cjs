/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#050c0a",
        secondary: "#7abf6a",
        tertiary: "#0d1a0f",
        "black-100": "#090f0a",
        "black-200": "#060b07",
        "white-100": "#e8ffe8",
        "cyber-green": "#9eff00",
        "cyber-red": "#e63030",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #0a2010",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/herobg.png')",
      },
    },
  },
  plugins: [],
};
