/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        darkCard: "#161e2e",
        darkBorder: "#243048",
        leetcodeYellow: "#ffa116",
        leetcodeGreen: "#00b8a3",
        leetcodeRed: "#ef4743",
        leetcodeBlue: "#3b82f6",
      },
    },
  },

  plugins: [],
};