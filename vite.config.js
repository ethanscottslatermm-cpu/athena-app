import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        globIgnores: ['**/Themes/**', '**/favicon*', '**/images/dashboard/**'],
        runtimeCaching: [
          {
            urlPattern: /\/images\/sessions\/.+\.webp$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'session-images-v1',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/images\/dashboard\/.+\.(png|webp|jpg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dashboard-images-v1',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'Athena',
        short_name: 'Athena',
        description: 'Your strength. Your cycle. Your story.',
        theme_color: '#F2EDE8',
        background_color: '#F2EDE8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
