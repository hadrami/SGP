/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#40916c',
          dark: '#2d6a4f',
          light: '#52b788',
        },
        secondary: {
          DEFAULT: '#ffff3f',
          dark: '#ffd100',
          light: '#ffff8c',
        },
        accent: {
          DEFAULT: '#90e0ef',
          light: '#caf0f8',
          dark: '#00b4d8',
        }
      }
    },
  },
  plugins: [],
}