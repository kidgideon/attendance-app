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
    minify: false, // Disables minification to reduce processing power usage
    sourcemap: false, // Disables source maps to reduce memory consumption
    chunkSizeWarningLimit: 2000, // Avoids warnings for large chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Moves third-party dependencies to a separate chunk
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Ensures core dependencies are pre-optimized
    esbuildOptions: {
      target: 'esnext', // Optimizes for modern browsers
    }
  }
});
