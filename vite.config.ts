import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
    manifest: {
      name: 'HotelFlow — Dijital Resepsiyon',
      short_name: 'HotelFlow',
      description: 'QR tabanlı dijital resepsiyon ve otel içi talep yönetim sistemi',
      lang: 'tr',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0a1628',
      theme_color: '#0a1628',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // App shell (JS/CSS/HTML) is precached for instant loads and basic
      // offline support. Supabase API calls are always network-first —
      // this is a live request board, stale cached data would be
      // actively misleading, so we don't cache those responses.
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
    },
  }), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})