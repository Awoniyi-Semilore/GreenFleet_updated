/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Brand */
        'brand-green-900': '#002E12',
        'brand-green':     '#006527',
        'brand-green-700': '#005020',
        'brand-green-100': '#E6F0E9',
        'brand-green-50':  '#F2F7F3',
        'brand-lime':      '#85CA23',
        'brand-lime-100':  '#EFF8DC',
        /* Ink */
        'ink-900': '#111816',
        'ink-700': '#2C3A30',
        'ink-600': '#4B564E',
        'ink-400': '#7A8C7F',
        'ink-300': '#94A198',
        'ink-200': '#B8C4BB',
        'ink-100': '#D8E0DA',
        /* Surface */
        'surface':       '#FFFFFF',
        'surface-muted': '#F5F7F5',
        'surface-hover': '#EEF3EF',
        /* Border */
        'border-subtle': '#E1E7E2',
        'border':        '#CDD6CF',
        /* Status */
        'status-pending':   '#B7791F',
        'status-approved':  '#006527',
        'status-rejected':  '#B3261E',
        'status-progress':  '#1D4ED8',
        'status-completed': '#15803D',
      },
      fontFamily: {
        sans: ['"Inter"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['12px', { lineHeight: '16px' }],
        sm:    ['13px', { lineHeight: '20px' }],
        base:  ['14px', { lineHeight: '22px' }],
        md:    ['15px', { lineHeight: '24px' }],
        lg:    ['17px', { lineHeight: '26px' }],
        xl:    ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '38px' }],
      },
      borderRadius: {
        card: '14px',
        btn:  '8px',
        xl:   '12px',
        '2xl':'16px',
        '3xl':'20px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.10)',
        xs:     '0 1px 2px rgba(0,0,0,0.06)',
      },
      animation: {
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(133,202,35,0.55)' },
          '70%':  { boxShadow: '0 0 0 8px rgba(133,202,35,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(133,202,35,0)' },
        },
      },
    },
  },
  plugins: [],
}
