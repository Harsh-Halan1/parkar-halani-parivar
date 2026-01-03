import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['axios', 'i18next'],
        },
        // Optimize asset naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generate source maps for debugging
    sourcemap: false,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['axios', 'i18next'],
  },
  // Enable compression in dev server
  server: {
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
});
