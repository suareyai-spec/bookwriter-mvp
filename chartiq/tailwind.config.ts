import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#26acf7',
        accent: '#10b981',
        dark: '#231f20',
        surface: '#f5f5f7',
      },
    },
  },
  plugins: [],
};
export default config;
