import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3482',
      '/users': 'http://localhost:3482',
      '/products': 'http://localhost:3482',
      '/boats': 'http://localhost:3482',
      '/bookings': 'http://localhost:3482',
      '/forum': 'http://localhost:3482',
      '/uploads': 'http://localhost:3482',
    },
  },
})
