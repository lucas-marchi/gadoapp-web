/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: withOpacity('--color-primary-50'),
          100: withOpacity('--color-primary-100'),
          200: withOpacity('--color-primary-200'),
          300: withOpacity('--color-primary-300'),
          400: withOpacity('--color-primary-400'),
          500: withOpacity('--color-primary-500'),
          600: withOpacity('--color-primary-600'),
          700: withOpacity('--color-primary-700'),
          800: withOpacity('--color-primary-800'),
          900: withOpacity('--color-primary-900'),
          950: withOpacity('--color-primary-950'),
        },
        secondary: {
          50: withOpacity('--color-secondary-50'),
          100: withOpacity('--color-secondary-100'),
          200: withOpacity('--color-secondary-200'),
          300: withOpacity('--color-secondary-300'),
          400: withOpacity('--color-secondary-400'),
          500: withOpacity('--color-secondary-500'),
          600: withOpacity('--color-secondary-600'),
          700: withOpacity('--color-secondary-700'),
          800: withOpacity('--color-secondary-800'),
          900: withOpacity('--color-secondary-900'),
          950: withOpacity('--color-secondary-950'),
        },
        danger: {
          50: withOpacity('--color-danger-50'),
          100: withOpacity('--color-danger-100'),
          200: withOpacity('--color-danger-200'),
          300: withOpacity('--color-danger-300'),
          400: withOpacity('--color-danger-400'),
          500: withOpacity('--color-danger-500'),
          600: withOpacity('--color-danger-600'),
          700: withOpacity('--color-danger-700'),
          800: withOpacity('--color-danger-800'),
          900: withOpacity('--color-danger-900'),
          950: withOpacity('--color-danger-950'),
        },
        warning: {
          50: withOpacity('--color-warning-50'),
          100: withOpacity('--color-warning-100'),
          200: withOpacity('--color-warning-200'),
          300: withOpacity('--color-warning-300'),
          400: withOpacity('--color-warning-400'),
          500: withOpacity('--color-warning-500'),
          600: withOpacity('--color-warning-600'),
          700: withOpacity('--color-warning-700'),
          800: withOpacity('--color-warning-800'),
          900: withOpacity('--color-warning-900'),
          950: withOpacity('--color-warning-950'),
        },
        accent: {
          50: withOpacity('--color-accent-50'),
          100: withOpacity('--color-accent-100'),
          200: withOpacity('--color-accent-200'),
          300: withOpacity('--color-accent-300'),
          400: withOpacity('--color-accent-400'),
          500: withOpacity('--color-accent-500'),
          600: withOpacity('--color-accent-600'),
          700: withOpacity('--color-accent-700'),
          800: withOpacity('--color-accent-800'),
          900: withOpacity('--color-accent-900'),
          950: withOpacity('--color-accent-950'),
        },
        neutral: {
          50: withOpacity('--color-neutral-50'),
          100: withOpacity('--color-neutral-100'),
          200: withOpacity('--color-neutral-200'),
          300: withOpacity('--color-neutral-300'),
          400: withOpacity('--color-neutral-400'),
          500: withOpacity('--color-neutral-500'),
          600: withOpacity('--color-neutral-600'),
          700: withOpacity('--color-neutral-700'),
          800: withOpacity('--color-neutral-800'),
          900: withOpacity('--color-neutral-900'),
          950: withOpacity('--color-neutral-950'),
        },
      },
    },
  },
  plugins: [],
}
