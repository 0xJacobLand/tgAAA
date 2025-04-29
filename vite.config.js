import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // все запросы к /api/** будут перенаправляться на http://localhost:3001/api/**
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // если ваш бекенд-функции ожидают путь без префикса /api,
        // можно раскомментировать rewrite:
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
