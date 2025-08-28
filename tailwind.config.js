/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px (was 12px)
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px (was 14px)
        'base': ['0.9375rem', { lineHeight: '1.5rem' }], // 15px (was 16px)
        'lg': ['1.0625rem', { lineHeight: '1.625rem' }], // 17px (was 18px)
        'xl': ['1.1875rem', { lineHeight: '1.75rem' }],  // 19px (was 20px)
        '2xl': ['1.4375rem', { lineHeight: '2rem' }],    // 23px (was 24px)
        '3xl': ['1.8125rem', { lineHeight: '2.25rem' }], // 29px (was 30px)
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px (was 36px)
        '5xl': ['2.875rem', { lineHeight: '1' }],        // 46px (was 48px)
        '6xl': ['3.625rem', { lineHeight: '1' }],        // 58px (was 60px)
        '7xl': ['4.375rem', { lineHeight: '1' }],        // 70px (was 72px)
        '8xl': ['5.625rem', { lineHeight: '1' }],        // 90px (was 96px)
        '9xl': ['7.125rem', { lineHeight: '1' }],        // 114px (was 128px)
      }
    },
  },
  plugins: [],
}
