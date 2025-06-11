// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './pages/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
    './node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}', // 加上這行來支持 shadcn/ui 元件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
