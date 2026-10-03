/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './src/index.html'],
  theme: {
    extend: {
      // ============================================================
      // 1. MOBILE — altura dinâmica + safe areas
      // ============================================================
      height: {
        dvh: '100dvh',
      },
      minHeight: {
        dvh: '100dvh',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // ============================================================
      // 2. BREAKPOINTS
      // ============================================================
      screens: {
        xs: '375px', // iPhone SE
        sm: '414px', // iPhone 11 / Pro Max
        md: '768px', // Tablet
        lg: '1024px', // Desktop
      },

      // ============================================================
      // 3. CORES
      // ============================================================
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
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
        // Cores de negócio
        chapa: '#ef4444',
        montagem: '#f59e0b',
        imediato: '#22c55e',
        comanda: '#8b5cf6',
      },

      // ============================================================
      // 4. TIPOGRAFIA
      // ============================================================
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ============================================================
      // 5. ANIMAÇÕES
      // ============================================================
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        shake: 'shake 0.4s ease-in-out',

        // Entradas
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',

        // Saídas (para toasts que estão indo embora)
        'slide-up-out': 'slideUpOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down-out': 'slideDownOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        // -------- ENTRADA --------
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          // Vem de baixo para cima (banner LGPD, bottom-sheet)
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          // Vem de cima para baixo (toast no topo)
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        // -------- SAÍDA --------
        slideUpOut: {
          // Sobe e desaparece
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-16px)', opacity: '0' },
        },
        slideDownOut: {
          // Desce e desaparece
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(16px)', opacity: '0' },
        },

        // -------- FEEDBACK --------
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },

      // ============================================================
      // 6. SOMBRAS
      // ============================================================
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'bottom-sheet': '0 -4px 20px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
