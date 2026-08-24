/** @type {import('tailwindcss').Config} */
// Light-theme palette. The token NAMES are kept identical to the dark variant
// (Admin Starter (Dark)) so every component works unchanged in either theme —
// only the VALUES differ. Read them semantically, not literally:
//   ink  = structural surfaces & borders (higher number = closer to the page
//          background; 950/900/850 are the card/sidebar surfaces)
//   mist = text (DEFAULT = primary, muted = secondary, dim = faint)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#ffffff',
          900: '#ffffff',
          850: '#ffffff',
          800: '#eef1f7',
          700: '#dfe5f0',
          600: '#cbd5e6',
          500: '#a9b8d1',
        },
        mist: {
          DEFAULT: '#1e2635',
          muted: '#5c6b85',
          dim: '#8a97ad',
        },
        accent: {
          DEFAULT: '#6366f1',
          600: '#4f46e5',
          500: '#4338ca',
          400: '#4f46e5',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(16,24,40,0.05), 0 8px 24px -12px rgba(16,24,40,0.12)',
        glow: '0 0 0 1px rgba(99,102,241,0.20), 0 8px 30px -8px rgba(99,102,241,0.35)',
      },
      backgroundImage: {
        'accent-grad': 'linear-gradient(135deg, #7c8bff 0%, #6366f1 50%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [],
};
