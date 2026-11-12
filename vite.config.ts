import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the same dist/ works at https://<user>.github.io/<repo>/.
export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'TickTack – Die Uhr lernen',
        short_name: 'TickTack',
        description: 'Spielend analoge und digitale Uhrzeiten lesen. Auf Deutsch, offline, ohne Werbung.',
        lang: 'de-CH',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'any',
        background_color: '#8fd4ff',
        theme_color: '#1f6feb',
        start_url: './',
        scope: './',
        id: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\.[a-z0-9]+$/i],
      },
    }),
  ],
  server: { host: '127.0.0.1', port: 4178, strictPort: true },
  preview: { host: '127.0.0.1', port: 4181, strictPort: true },
})
