/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#111419',
          card: '#191E25',
          surface: '#202731',
          border: '#2A3340',
          text: '#ECEBE7',
          muted: '#929BA6',
          gold: '#C3A36B',
          green: '#65B88A',
          red: '#D66F6F',
          blue: '#7D9CB7',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
