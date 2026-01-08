import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Artinya: Kalau ada request ke /api, tolong belokkan ke port 8000
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
        // Note: rewrite ini menghapus '/api' sebelum dikirim ke Python.
        // TAPI: Karena di main.py kita pakai app.post("/predict"), 
        // dan di vercel.json kita mapping /api ke root,
        // Sebaiknya untuk Vercel production logic, kita sesuaikan endpointnya.
      }
    }
  }
})