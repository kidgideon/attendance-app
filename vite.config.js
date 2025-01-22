import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows network access (e.g., by other devices on the same Wi-Fi)
  },
  build: {
    outDir: 'dist', // Ensure the output directory for production builds
  },
});
