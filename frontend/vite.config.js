import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    hmr: {
      // Ces options sont importantes pour Docker
      host: 'localhost',
      port: 5174,
      overlay: true
    },
    watch: {
      usePolling: true // Important pour Docker et certains systèmes de fichiers
    }
  }
})