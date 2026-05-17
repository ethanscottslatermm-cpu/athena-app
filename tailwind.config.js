/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:    '#C9A86C',
        mauve:   '#6B4F6B',
        rose:    '#C49A9A',
        ivory:   '#F4EFE6',
        sage:    '#8FAF8A',
        crimson: '#8B1A1A',
      },
      fontFamily: {
        cinzel:   ['Cinzel', 'serif'],
        garamond: ['Cormorant Garamond', 'serif'],
        script:   ['Great Vibes', 'cursive'],
      }
    }
  },
  plugins: []
}
