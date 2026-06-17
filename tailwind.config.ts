import { Config } from 'tailwindcss'

export default {
  important: '#document-editor-tailwind-root',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#008f91',
      },
    },
  },
} satisfies Config
