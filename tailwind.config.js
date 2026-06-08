/** @type {import('tailwindcss').Config} */
// Drydock uses a CSS-variable-driven design system (see src/index.css :root).
// Tailwind is here for layout utilities only — colors, type, and component
// classes live in plain CSS so the design tokens stay in one place.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
