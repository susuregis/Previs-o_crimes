/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#0ea5e9',
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#10b981',
      }
    },
  },
  plugins: [],
}
