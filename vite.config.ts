import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const base = mode === 'github-pages' ? '/LabnoBooking/' : '/'

  return {
    base,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-app': ['firebase/app', 'firebase/firestore'],
            'date-fns': ['date-fns'],
          }
        }
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
        manifest: {
          name: 'Р›Р°Р±РЅРѕ вЂ” Р‘СЂРѕРЅРёСЂРѕРІР°РЅРёРµ',
          short_name: 'Р›Р°Р±РЅРѕ',
          description: 'РЈРїСЂР°РІР»РµРЅРёРµ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµРј РґРѕРјР° Рё Р±Р°РЅРё',
          theme_color: '#14110e',
          background_color: '#14110e',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          icons: [
            {
              src: `${base}icon-192.svg`,
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: `${base}icon-512.svg`,
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] }
              }
            }
          ]
        }
      })
    ]
  }
})
