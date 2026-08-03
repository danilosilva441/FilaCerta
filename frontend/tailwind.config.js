/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/index.html",
  ],
  theme: {
    extend: {
      // 1. EXTENSÕES PARA MOBILE (Novo)
      height: {
        'dvh': '100dvh', // Usa a altura real da tela visível no celular
      },
      minHeight: {
        'dvh': '100dvh',
      },
      spacing: {
        // Permite usar as áreas seguras do iPhone direto nas classes.
        // Exemplo: pt-safe-top, pb-safe-bottom
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // 2. BREAKPOINTS
      screens: {
        'xs': '375px',   // iPhone SE
        'sm': '414px',   // iPhone 11 / Pro Max
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
      },

      // 3. CORES
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Vermelho principal
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        success: {
          DEFAULT: '#16a34a',
          light: '#dcfce7',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
        info: {
          DEFAULT: '#2563eb',
          light: '#dbeafe',
        },
        // Cores específicas do negócio
        chapa: '#ef4444',
        montagem: '#f59e0b',
        imediato: '#22c55e',
        comanda: '#8b5cf6',
      },

      // 4. TIPOGRAFIA
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // 5. ANIMAÇÕES (Sensação de App Nativo)
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)', // Curva mais suave
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      // 6. SOMBRAS
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'bottom-sheet': '0 -4px 20px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
