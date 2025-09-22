import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portFromEnv = Number(process.env.VITE_PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true, // 0.0.0.0 внутри контейнера
    port: portFromEnv,
    strictPort: true,
    hmr: {
      clientPort: portFromEnv,
    },
  },
});
