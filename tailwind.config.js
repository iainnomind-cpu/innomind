/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0d7ff2',
        // ponytail: true zinc dark — no blueish tint, more industrial authority
        'background-light': '#F4F4F5',   /* zinc-100 */
        'background-dark': '#09090B',    /* zinc-950 — was #101922 blueish */
        'surface-dark':    '#18181B',    /* zinc-900 — elevated surface */
        'border-dark':     '#27272A',    /* zinc-800 — visible but not loud */
        'brand-orange': '#FF6B00',
        // Corē Brand Palette
        'core-blue':     '#2563EB',
        'core-electric': '#38BDF8',      /* sky-400 — high contrast on dark */
        'core-signal':   '#38AAFF',
        'core-ice':      '#E0F2FE',      /* sky-100 — light bg tint */
        'core-arctic':   '#F5F8FF',
        'core-void':     '#05080F',
        // Trak Brand Palette
        'trak-primary':  '#9333EA',
        'trak-electric': '#C084FC',      /* purple-400 — dominant accent on dark */
        'trak-signal':   '#D8B4FE',      /* purple-300 */
        'trak-ice':      '#F3E8FF',
        'trak-void':     '#0B0914',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        brand: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        // ponytail: global radius reduction — industrial B2B feel, not consumer-app bubbles
        DEFAULT: '0.125rem',  /* 2px — barely there */
        sm:      '0.125rem',
        md:      '0.25rem',
        lg:      '0.25rem',   /* 4px — previously 8px */
        xl:      '0.375rem',  /* 6px — previously 12px */
        '2xl':   '0.5rem',    /* 8px — previously 16px */
        '3xl':   '0.75rem',
        full:    '9999px',    /* keep for pills / avatars */
      },
      boxShadow: {
        // Hard offset shadow — neobrutalista controlado, only where intentional
        hard:          '3px 3px 0px 0px currentColor',
        'hard-blue':   '3px 3px 0px 0px #2563EB',
        'hard-purple': '3px 3px 0px 0px #9333EA',
      },
    },
  },
  plugins: [],
};
