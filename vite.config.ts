import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': "/src",
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://safary-kappa.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
