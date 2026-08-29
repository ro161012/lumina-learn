/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'rgba(7, 10, 19, 0.7)',
          900: 'rgba(11, 16, 29, 0.7)',
          850: 'rgba(16, 23, 40, 0.7)',
          800: 'rgba(20, 28, 49, 0.65)',
          700: 'rgba(29, 39, 66, 0.6)',
          600: 'rgba(42, 54, 87, 0.55)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite alternate',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.1), inset 0 1px 0 rgba(255,255,255,0.08)' },
          '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.12)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
