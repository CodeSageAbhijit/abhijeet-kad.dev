import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
