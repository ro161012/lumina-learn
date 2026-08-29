import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // onnxruntime-web ships WASM + worker assets that must not be pre-bundled
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  build: {
    chunkSizeWarningLimit: 5000,
    target: 'es2020',
  },
})
