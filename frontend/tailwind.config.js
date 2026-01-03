/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verified: '#10b981',
        suspicious: '#f59e0b',
        fake: '#ef4444',
        primary: '#3b82f6',
      },
    },
  },
  plugins: [],
}