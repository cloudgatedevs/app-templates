/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#080b12',
          900: '#0c111c',
          850: '#111827',
          800: '#161f31',
          700: '#1e293f',
          600: '#2a3650',
          500: '#3a4966',
        },
        mist: {
          DEFAULT: '#e8edf7',
          muted: '#95a2bd',
          dim: '#66728e',
        },
        accent: {
          DEFAULT: '#7c8bff',
          600: '#6366f1',
          500: '#818cf8',
          400: '#a5b0ff',
        },
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(124,139,255,0.25), 0 8px 30px -8px rgba(124,139,255,0.35)',
      },
      backgroundImage: {
        'accent-grad': 'linear-gradient(135deg, #7c8bff 0%, #6366f1 50%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [],
};
