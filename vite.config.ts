import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  root: 'src/ui/viewer',
  build: {
    outDir: '../../../plugin/ui',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/ui/viewer/viewer.html'),
      output: {
        entryFileNames: 'viewer-bundle.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'viewer.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
});
