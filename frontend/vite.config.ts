import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'ReadMark OS',
          short_name: 'ReadMark',
          description: 'A personal reading memory, blog and review operating system.',
          theme_color: '#090b11',
          background_color: '#090b11',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            { src: `${base}pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
            { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
  }
})
