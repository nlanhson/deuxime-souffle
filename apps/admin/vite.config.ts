import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  // 5174 so the admin console and the EHPAD space (5173) can run side by side.
  server: { port: 5174, open: true, host: true },
});
