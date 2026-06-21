/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#1e293b', // Custom slate color for subtle borders/cards
        }
      }
    },
  },
  plugins: [],
}
