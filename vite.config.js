import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:5174,
    proxy: {
      '/api': {
        target: 'https://probable-goldfish-r44rj44rp596hq4j-3001.app.github.dev',
        changeOrigin: true,
        secure: false,
      },
      '/search': {  // Add this proxy rule
        target: 'https://probable-goldfish-r44rj44rp596hq4j-3001.app.github.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
