import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifestFilename: 'manifest.json',
      includeAssets: ['icons/*.png'],
      
      devOptions: {
        enabled: true,
        type: 'module',
      },
      
      manifest: {
        name: 'BB Maintenance - Sistema de Gestión de Mantenimiento',
        short_name: 'BB Maintenance',
        description: 'Sistema CMMS para gestión de órdenes de trabajo de mantenimiento industrial',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#229877',
        orientation: 'portrait-primary',
        categories: ['business', 'productivity'],
        gcm_sender_id: '901493337912',
        icons: [
          { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
          { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      } as any, 
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})