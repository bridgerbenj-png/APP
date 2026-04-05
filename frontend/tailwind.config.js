/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        japanese: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
