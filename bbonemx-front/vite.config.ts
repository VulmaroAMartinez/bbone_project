import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
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
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
