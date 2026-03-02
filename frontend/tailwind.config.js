/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
        blob: 'blob 10s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(40px,-60px) scale(1.08)' },
          '100%': { transform: 'translate(-30px,30px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}
