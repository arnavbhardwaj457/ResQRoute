import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Core dark surface palette ── */
        surface: {
          DEFAULT: '#060a13',
          50: '#0d1520',
          100: '#0a1018',
          200: '#111927',
          300: '#1a2332',
          400: '#243040',
          500: '#334155',
        },
        /* ── Red accent ── */
        accent: {
          red: {
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
          },
          /* ── Blue accent ── */
          blue: {
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
          },
        },
        /* ── Cyber neon palette ── */
        cyber: {
          cyan: '#00f0ff',
          'cyan-dim': '#00b8c7',
          green: '#00ff88',
          'green-dim': '#00c96b',
          purple: '#a855f7',
          'purple-dim': '#7c3aed',
          pink: '#ff006e',
          orange: '#ff6b35',
          yellow: '#ffd500',
        },
        'cyber-cyan': '#00f0ff',
        'neon-green': '#00ff88',
        'holo-purple': '#a855f7',
        /* ── Emergency severity colors ── */
        emergency: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        },
        /* ── Legacy brand alias → blue accent ── */
        brand: {
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
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 15px rgba(59, 130, 246, 0.3), 0 0 45px rgba(59, 130, 246, 0.1)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3), 0 0 45px rgba(239, 68, 68, 0.1)',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.3), 0 0 45px rgba(0, 240, 255, 0.1)',
        'glow-sm': '0 0 8px rgba(59, 130, 246, 0.25)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.36)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'neon-red': '0 0 6px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.2), 0 0 60px rgba(239, 68, 68, 0.1)',
        'neon-cyan': '0 0 6px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.2), 0 0 60px rgba(0, 240, 255, 0.1)',
        'neon-blue': '0 0 6px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'border-flow': 'borderFlow 4s linear infinite',
        scanner: 'scanner 3s ease-in-out infinite',
        'data-stream': 'dataStream 20s linear infinite',
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        borderFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scanner: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        dataStream: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
