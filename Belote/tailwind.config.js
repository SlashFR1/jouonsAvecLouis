/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          light: '#1f7a46',
          DEFAULT: '#14532d',
          dark: '#052e16',
          deep: '#031a0c',
        },
        casino: {
          blue: '#0b192c',
          navy: '#1e3e62',
          gold: '#d4af37',
          burgundy: '#4a0e17',
        },
        wood: {
          light: '#5c351f',
          DEFAULT: '#3e2216',
          dark: '#24140b',
          border: '#1a0e08',
        },
        gold: {
          light: '#fde047',
          DEFAULT: '#fbbf24',
          dark: '#d97706',
          rich: '#b45309',
        },
      },
      boxShadow: {
        'trump-glow': '0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(245, 158, 11, 0.35)',
        'trump-glow-lg': '0 0 25px rgba(251, 191, 36, 0.8), 0 0 45px rgba(245, 158, 11, 0.5)',
        'card-hover': '0 20px 30px -8px rgba(0, 0, 0, 0.7), 0 10px 15px -5px rgba(0, 0, 0, 0.5)',
        'table-felt': 'inset 0 0 120px rgba(0, 0, 0, 0.85), inset 0 0 40px rgba(0, 0, 0, 0.6)',
        'wood-rim': 'inset 0 3px 5px rgba(255, 255, 255, 0.25), inset 0 -4px 10px rgba(0, 0, 0, 0.9), 0 30px 60px -15px rgba(0, 0, 0, 0.95)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        // Chute avec Rebond Élastique (Bounce Entry)
        'bounce-drop': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-350px) scale(0.85)',
          },
          '50%': {
            opacity: '1',
            transform: 'translateY(16px) scale(1.06, 0.92)',
          },
          '68%': {
            transform: 'translateY(-12px) scale(0.97, 1.03)',
          },
          '82%': {
            transform: 'translateY(6px) scale(1.02, 0.99)',
          },
          '92%': {
            transform: 'translateY(-2px) scale(0.99, 1.01)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        // Sortie vers le haut
        'bounce-leave': {
          '0%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
          '20%': {
            transform: 'scale(1.05) translateY(10px)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.8) translateY(-300px)',
          },
        },
        // Animation de pose de carte
        'card-play': {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px) scale(0.8) rotate(-6deg)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1) rotate(0deg)',
          },
        },
        // Pulsation douce du contour atout
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(245, 158, 11, 0.35)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(251, 191, 36, 0.9), 0 0 45px rgba(245, 158, 11, 0.6)',
          },
        },
      },
      animation: {
        'bounce-drop': 'bounce-drop 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'bounce-leave': 'bounce-leave 0.4s ease-in forwards',
        'card-play': 'card-play 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
