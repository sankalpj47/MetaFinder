/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#030014',
        accent: '#AB83FF',
        light:{
          100: '#D6C6FF',
          200: '#E0D3FF',
          300: '#EBE1FF', 
        }
      },
      borderRadius: {
       '4xl': '2rem',   
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
};
