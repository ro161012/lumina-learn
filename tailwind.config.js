/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0e0d0b',
          900: '#151310',
          850: '#1b1915',
          800: '#221f1a',
          700: '#2e2a23',
          600: '#3a352c',
        },
        paper: {
          100: '#f2eee5',
          200: '#e6e0d3',
          300: '#c9c2b1',
          400: '#a29b8a',
          500: '#7a7364',
          600: '#57524a',
        },
        accent: {
          300: '#f2c669',
          400: '#e9ae44',
          500: '#d99a2b',
          600: '#b57f1f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.4)',
        lift: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 4px 16px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
