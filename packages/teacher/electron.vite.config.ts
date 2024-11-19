import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron/main',
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist-electron/preload'
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      outDir: 'dist'
    },
    plugins: [vue()],
    server: {
      host: true, // LANへのアクセスを許可
      port: 5173,
      strictPort: true // Make sure the port used is fixed
    }
  }
})