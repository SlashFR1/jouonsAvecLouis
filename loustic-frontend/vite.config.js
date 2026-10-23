import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND = process.env.LOUSTIC_BACKEND ?? 'https://jouonsaveclouis.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true => accessible depuis les téléphones du même Wi-Fi (http://192.168.x.x:5173)
    host: true,
    port: 5173,
    // Le proxy redirige vers Render si on utilise des URLs relatives
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true, secure: false },
      '/ws-game': { target: BACKEND.replace(/^http/, 'ws'), ws: true, changeOrigin: true, secure: false },
    },
  },
})
