import path from 'path';
import { fileURLToPath } from 'url'; // Import 'fileURLToPath'
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Ini adalah cara ESM modern untuk membuat ulang '__dirname'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Sekarang alias ini 100% 'ESM-safe'
      '@': path.resolve(__dirname, './src'),
    },
  },
});
