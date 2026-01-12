export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'yarn-pink': '#FFB3BA',
          'yarn-blue': '#BAE1FF',
          'yarn-mint': '#BAFFC9',
          'yarn-lavender': '#E0BBE4',
          'orange': '#FF6B35',
          'orange-light': '#FF8C61',
          'primary': '#6060E6',
          'gray-dark': '#313131',
          'gray-medium': '#4C4C4C',
        },
        fontFamily: {
          'sans': ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }