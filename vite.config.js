import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'],
  plugins: [react()],
  server: {
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.local/**'] },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    proxy: {
      '/pulse/ev': {
        target: 'https://api-eu.mixpanel.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pulse\/ev\/?/, '/track/'),
      },
      '/pulse': {
        target: 'https://api-eu.mixpanel.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pulse/, ''),
      },
      '/sdo': {
        target: 'https://sdo.gsfc.nasa.gov',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/sdo/, '/assets/img/latest'),
      },
    },
  },
  optimizeDeps: {
    include: ['three/examples/jsm/loaders/GLTFLoader.js'],
  },
  build: {
    rollupOptions: {
      input: {
        portfolio: fileURLToPath(new URL('./index.html', import.meta.url)),
        retro: fileURLToPath(new URL('./retro/index.html', import.meta.url)),
      },
    },
  },
})
