import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getApiUrl } from './src/shared/config/env';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  const portFromEnv = Number(env.VITE_PORT) || 5173;
  const API_TARGET = getApiUrl(env);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@backend': path.resolve(__dirname, '../backend/src'),
      },
    },
    server: {
      host: true,
      port: portFromEnv,
      strictPort: true,
      hmr: {
        clientPort: portFromEnv,
      },
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
