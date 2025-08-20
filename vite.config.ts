import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/labs-1.0/', // <-- REQUIRED for GitHub Pages
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});


