import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel sets VERCEL=1; keep Laravel public/ build for local Laragon.
const isVercel = Boolean(process.env.VERCEL)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: isVercel ? 'dist' : '../public',
    emptyOutDir: isVercel,
  },
  server: {
    host: true,
    allowedHosts: ['sheath-fastness-disfigure.ngrok-free.dev'],
  },
})
