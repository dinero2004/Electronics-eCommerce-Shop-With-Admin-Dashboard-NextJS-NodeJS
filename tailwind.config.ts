import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-yellow':'#D5A443',
        brand: {
          ink: '#17201D',
          pine: '#49675F',
          sage: '#A9BBB5',
          mist: '#E8EFEC',
          cream: '#F7F5EF',
          sand: '#DDD5C7',
        },
      }
    },
  },  
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms"), require("daisyui")],
};
export default config;
