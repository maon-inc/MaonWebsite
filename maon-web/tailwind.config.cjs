/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui'],
      },
      colors: {
        brand: {
          DEFAULT: '#101010',   // charcoal text
          light:   '#f5f3ee',   // beige background
        },
      },
    },
  },
  plugins: [],
};
