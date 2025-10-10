import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: ['codemirror', '@codemirror/lang-markdown', '@codemirror/state', '@codemirror/view'],
          markdown: ['marked', 'highlight.js', 'dompurify'],
          export: ['html2canvas', 'jspdf', 'file-saver']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})