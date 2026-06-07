/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          600: '#9B1C1C',
          700: '#7F1D1D',
          800: '#6B1414',
          900: '#450a0a',
        }
      }
    },
  },
  plugins: [],
}
