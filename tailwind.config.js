/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen:   '#F2EDE8',
        surface: '#C4AFA8',
        sage:    '#8FA58C',
        rose:    '#C4859A',
        brown:   '#252220',
        taupe:   '#5A4C48',
        greige:  '#8A7E78',
        mist:    '#D6CFC9',
        // legacy aliases kept for phaseEngine / module shells
        gold:    '#C4859A',
        mauve:   '#C4AFA8',
        ivory:   '#F2EDE8',
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
