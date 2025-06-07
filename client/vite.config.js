// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
};
