import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        global: true,
        process: true,
        Buffer: true,
      },
      protocolImports: false,
    }),
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['@perawallet/connect', 'react', 'react-dom', 'algosdk'],
    exclude: [],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
