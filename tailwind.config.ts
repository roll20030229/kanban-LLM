import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a12',
        foreground: '#e4e4f0',
        card: '#16162a',
        'card-foreground': '#e4e4f0',
        'todo': '#00f0ff',
        'in-progress': '#ff00aa',
        'in-review': '#a855f7',
        'done': '#00ffd5',
        muted: {
          DEFAULT: '#8888aa',
          foreground: '#8888aa',
        },
        primary: {
          DEFAULT: '#00f0ff',
          foreground: '#0a0a12',
        },
        secondary: {
          DEFAULT: '#ff00aa',
          foreground: '#0a0a12',
        },
        accent: {
          DEFAULT: '#a855f7',
          foreground: '#e4e4f0',
        },
        destructive: {
          DEFAULT: '#ff3366',
          foreground: '#e4e4f0',
        },
        border: 'rgba(136, 136, 170, 0.2)',
        input: '#1a1a2e',
        ring: '#00f0ff',
        neon: {
          blue: '#00f0ff',
          pink: '#ff00aa',
          purple: '#a855f7',
          cyan: '#00ffd5',
          yellow: '#ffff00',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 0, 170, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 255, 213, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 240, 255, 0.2)',
      },
      animation: {
        'neon-glow': 'neon-glow 2s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'border-flow': 'border-flow 4s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
      },
      keyframes: {
        'neon-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 20px #00f0ff',
          },
          '50%': {
            boxShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #00f0ff',
          },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
