/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#07070A',
        surface: {
          DEFAULT: '#0E0E14',
          raised: '#13131A',
        },
        accent: {
          blue: '#5B6DF5',
          bright: '#7B8FFF',
        },
        text: {
          primary: '#E8E8EF',
          secondary: '#A0A0B0',
          tertiary: '#606070',
        },
        border: {
          custom: '#1E1E28',
          subtle: '#15151E',
        },
        signal: {
          success: '#34D399',
          warning: '#F87171',
        },
        medic: {
          purple: '#A78BFA',
          dim: '#1A1625',
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(91, 109, 245, 0.3)',
      },
    },
  },
  plugins: [],
}
