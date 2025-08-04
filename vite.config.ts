import path from 'path';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: false, // Disable auto code splitting for build
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePattern: '.*\\.(test|spec)\\.(ts|tsx|js|jsx)$',
      disableLogging: true
    }),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Development server optimizations for low CPU usage
  server: {
    hmr: {
      overlay: true, // Enable overlay to see errors that might cause crashes
      // Let Vite choose available port automatically to prevent connection issues
      // port: 24678, // Commented out to auto-assign working port
      // Reduce aggressive reconnection attempts that cause rerenders
      timeout: 20000, // Increase timeout to 20s to reduce reconnection frequency
      host: 'localhost' // Explicitly set host to prevent connection issues
    },
    watch: {
      // Reduce file watching to minimize CPU usage
      ignored: [
        '**/node_modules/**', 
        '**/.git/**', 
        '**/dist/**', 
        '**/coverage/**',
        '**/backend/**',
        '**/logs/**',
        '**/data/**',
        '**/*.log',
        '**/*.db',
        '**/deployments/**',
        '**/contracts-backup/**',
        '**/temp/**',
        '**/testing/**',
        '**/tests/**'
      ],
      usePolling: false, // Use native file system events instead of polling
    },
    // Reduce server threads
    fs: {
      strict: false
    },
    // Disable caching in development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  // Optimize dependency handling
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'wagmi', 
      'viem',
      '@rainbow-me/rainbowkit',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'react-hot-toast',
      'siwe',
      'framer-motion',
      'lucide-react'
    ],
    exclude: [
      'index.es-PAXKC6SV.js'
    ],
    // Cache dependencies to reduce rebuilding
    force: false
  },
  // Build optimizations
  build: {
    target: 'esnext',
    minify: false, // Disable minification for faster builds
    // Reduce build complexity
    reportCompressedSize: false,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Simplify chunk strategy
        manualChunks: undefined
      },
      // Prevent hanging on large dependency trees
      maxParallelFileOps: 2,
      treeshake: false
    }
  },
  // Reduce memory usage
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
