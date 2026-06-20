/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        // `font-display` kept as an alias so existing usages render in the sans face.
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cool, soft neutral scale on a near-white canvas.
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Teal primary — replaces indigo. All `indigo-*` usages turn teal.
        indigo: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Coral secondary — replaces violet (accent badges/dots).
        violet: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        brand: {
          DEFAULT: '#0d9488',
          hover: '#0f766e',
          coral: '#fb7185',
        },
      },
      borderRadius: {
        // Softer, friendlier corners across the board.
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)',
        'card-hover': '0 14px 32px -12px rgba(13,148,136,0.28)',
      },
    },
  },
  plugins: [],
};
