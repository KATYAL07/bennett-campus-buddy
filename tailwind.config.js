/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          green: '#047857',
          'green-dark': '#065f46',
          'green-light': '#ecfdf5',
          amber: '#b45309',
          'amber-light': '#fef3c7',
          red: '#b91c1c',
          'red-light': '#fef2f2',
          surface: '#fafaf9',
          border: '#e7e5e4',
          muted: '#78716c',
          dark: '#1c1917',
        },
      },
    },
  },
  plugins: [],
};
