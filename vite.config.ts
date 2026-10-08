import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxying keeps the browser on one origin, so the API needs no CORS setup.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
