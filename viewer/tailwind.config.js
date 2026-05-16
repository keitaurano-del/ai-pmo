/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          '"Noto Sans JP"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#bcd2ff',
          300: '#92b3ff',
          400: '#6890ff',
          500: '#4a72ff',
          600: '#3251f0',
          700: '#283fcc',
          800: '#1d2e94',
          900: '#172577',
        },
      },
    },
  },
  plugins: [],
};
