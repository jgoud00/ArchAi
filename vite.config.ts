import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for production
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE === 'true' &&
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Source maps for production debugging
    sourcemap: false, // Set to true if needed
    rollupOptions: {
      output: {
        // Optimized chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Advanced manual chunking strategy
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI Libraries (large)
          'ui-vendor': [
            'lucide-react',
            'recharts',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
          ],

          // 3D Rendering (very large)
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],

          // Forms & Validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Backend
          'supabase-vendor': ['@supabase/supabase-js'],

          // PDF Generation
          'pdf-vendor': ['jspdf', 'html2canvas'],

          // State Management (separate for better caching)
          'state-vendor': ['zustand', 'zundo'],

          // XYFlow (blueprint editor)
          'flow-vendor': ['@xyflow/react'],
        },
      },
      onwarn(warning, warn) {
        // Suppress three-mesh-bvh BatchedMesh warning
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
          (warning.message && warning.message.includes('BatchedMesh'))
        ) {
          return
        }
        warn(warning)
      },
    },
    // Increase chunk size limit (optimized chunks are larger)
    chunkSizeWarningLimit: 1000, // 1MB
  },
  // Development optimizations
  server: {
    // Enable HMR
    hmr: true,
    // Open browser automatically
    open: false,
  },
  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
    open: false,
  },
})
