import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Included melologo.png in assets to ensure it is cached for offline use
      includeAssets: ['melologo.png'], 
      manifest: {
        name: 'Melo Battle',
        short_name: 'MeloBattle',
        description: 'Real-time skill battles and rewards',
        theme_color: '#6d28d9',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        icons: [
          {
            src: 'melologo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'melologo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})