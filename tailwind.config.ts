import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "main": "#51504C",
        "secondary": "#41403D",
        "secondary-dark": "#343331",
        "gray": "#9E9E9C",
        "gray-light": "#CACAC9",
        "white-light": "#E2E2E1"
      }
    }
  },
  plugins: []
}
export default config;
