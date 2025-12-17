import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['axios', 'i18next'],
        },
      },
    },
    // Generate source maps for debugging
    sourcemap: false,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['axios', 'i18next'],
  },
});
