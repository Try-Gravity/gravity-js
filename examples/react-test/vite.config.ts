import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point to local packages for development
      '@gravity-ai/react': resolve(__dirname, '../../packages/react/src'),
      '@gravity-ai/api': resolve(__dirname, '../../packages/api'),
    },
  },
});
