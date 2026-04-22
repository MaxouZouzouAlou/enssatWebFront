/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-text)'],
        title: ['var(--font-title)'],
        titleOverlap: ['var(--font-title-overlap)'],
        icon: ['var(--font-icon)'],
      },
      colors: {
        primary: {
          DEFAULT: '#2D8635',
          50:  '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#2D8635',
          600: '#276F2D',
          700: '#1E5922',
          800: '#154218',
          900: '#0B2B0E',
        },
        secondary: {
          DEFAULT: '#546E7A',
          50:  '#ECEFF1',
          100: '#CFD8DC',
          200: '#B0BEC5',
          300: '#90A4AE',
          400: '#78909C',
          500: '#546E7A',
          600: '#455A64',
          700: '#37474F',
          800: '#263238',
          900: '#102027',
        },
        tertiary: {
          DEFAULT: '#D35400',
          50:  '#FBE9E0',
          100: '#FFCCBC',
          200: '#FFAB91',
          300: '#FF8A65',
          400: '#FF7043',
          500: '#D35400',
          600: '#BF360C',
          700: '#A0290A',
          800: '#7D1D06',
          900: '#5A1003',
        },
        neutral: {
          DEFAULT: '#f5f0e6',
          50:  '#fffaf2',
          100: '#f5f0e6',
          200: '#E8ECEA',
          300: '#CDD5CF',
          400: '#A8B5AB',
          500: '#82918A',
          600: '#5E6E65',
          700: '#424E47',
          800: '#2B332E',
          900: '#161C18',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(function({ addVariant }) {
      addVariant('hover', '@media (hover: hover) and (pointer: fine) { &:hover }');
    }),
  ],
}
