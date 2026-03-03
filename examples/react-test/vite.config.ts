import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gravity-ai/react': path.resolve(__dirname, '../../packages/react/src'),
    },
  },
});
