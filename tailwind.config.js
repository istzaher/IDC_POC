/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          blue: '#0070f3',
          navy: '#003d6b',
          gray: '#f4f4f4',
        }
      }
    },
  },
  plugins: [],
} 