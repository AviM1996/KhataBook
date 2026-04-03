import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',

      workbox: {
        navigateFallback: '/index.html',   // ⭐ VERY IMPORTANT
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },

      manifest: {
        name: 'LedgerFlow',
        short_name: 'LedgerFlow',
        description: 'Digital ledger and accounting PWA for managing customers, transactions, and ledgers',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'react-router-dom',
      'recharts',
      'echarts',
      'react-icons/md',
      'react-hot-toast',
      '@tanstack/react-query',
      'axios',
    ]
  }
})
