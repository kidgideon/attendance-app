import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows network access (e.g., by other devices on the same Wi-Fi)
    port: process.env.PORT || 5173, // Use the default port (5173) or a custom port for deployment platforms like Render
  },
  build: {
    outDir: 'dist', // Ensure the output directory for production builds
  },
});
