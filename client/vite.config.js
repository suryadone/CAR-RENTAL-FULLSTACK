import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // 👈 important for Vercel routing
  build: {
    outDir: 'dist' // 👈 make sure this matches Vercel output directory
  },
  server: {
    port: 5173
  }
})
