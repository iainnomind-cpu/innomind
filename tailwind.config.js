/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0d7ff2',
        'background-light': '#f5f7f8',
        'background-dark': '#101922',
        'brand-orange': '#FF6B00',
        // Corē Brand Palette
        'core-blue': '#2563EB',
        'core-signal': '#38AAFF',
        'core-ice': '#72C8FF',
        'core-arctic': '#F5F8FF',
        'core-void': '#05080F',
        // Trak Brand Palette
        'trak-primary': '#9333EA',
        'trak-signal': '#C084FC',
        'trak-ice': '#F3E8FF',
        'trak-void': '#0F0B1A',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        brand: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
