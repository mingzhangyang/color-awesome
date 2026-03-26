import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html',
        hexToRgb: './hex-to-rgb/index.html',
        contrastChecker: './contrast-checker/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
