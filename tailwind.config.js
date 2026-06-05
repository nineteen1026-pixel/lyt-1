/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#DDE5FF',
          200: '#B3C4FF',
          300: '#809FFF',
          400: '#4D73FF',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070A19',
        },
        accent: {
          50: '#FFF3ED',
          100: '#FFE4D4',
          200: '#FFC5A8',
          300: '#FFA071',
          400: '#FF7A3A',
          500: '#FF6B35',
          600: '#E55A22',
          700: '#BF4516',
          800: '#99350F',
          900: '#7A2909',
        },
        surface: {
          50: '#F5F6FA',
          100: '#EBEDF3',
          200: '#D5D9E5',
          300: '#B8BFCE',
          400: '#9AA3B8',
          500: '#7D87A1',
        },
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
