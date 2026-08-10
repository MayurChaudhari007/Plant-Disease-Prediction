/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", // emerald-500
        secondary: "#047857", // emerald-700
        dark: "#1f2937",
        light: "#f9fafb"
      }
    },
  },
  plugins: [],
}
