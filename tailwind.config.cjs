/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--page-rgb) / <alpha-value>)",
        secondary: "var(--accent-soft)",
        tertiary: "var(--panel)",
        "black-100": "var(--panel)",
        "black-200": "var(--term-bg)",
        "white-100": "#eef1f8",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-soft": "var(--accent-soft)",
        "cyber-red": "#e63030",
      },
      boxShadow: {
        card: "0px 35px 120px -15px var(--page)",
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
