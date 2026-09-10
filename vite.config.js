import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pin the dev server to 5173 — the backend's CORS allow-list
    // (ALLOWED_ORIGIN in intervue-backend/.env) is set to
    // http://localhost:5173. strictPort makes Vite fail loudly if 5173
    // is already taken instead of silently moving to 5174, which would
    // make every API call fail CORS and surface as
    // "Couldn't reach the server."
    port: 5173,
    strictPort: true,
  },
})
