/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF5FF',
          200: '#BFDBFE',
          400: '#3B82F6',
          600: '#1A56DB',
          800: '#1E429F',
        }
      }
    },
  },
  plugins: [],
}
