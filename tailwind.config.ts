import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        paper: '#f7f6f2',
        muted: '#767676',
        accent: '#bfa06a' // refined gold accent
      },
      fontFamily: {
        display: ['ui-serif','Georgia','Times New Roman','Times','serif'],
        body: ['Inter','ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
