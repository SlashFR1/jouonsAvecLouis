import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND = process.env.LOUSTIC_BACKEND ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true => accessible depuis les téléphones du même Wi-Fi (http://192.168.x.x:5173)
    host: true,
    port: 5173,
    // Le proxy évite tout souci de CORS/IP : le téléphone ne parle qu'au serveur Vite
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/ws-game': { target: BACKEND.replace(/^http/, 'ws'), ws: true, changeOrigin: true },
    },
  },
})
