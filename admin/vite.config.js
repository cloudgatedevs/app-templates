import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `npm run build` -> optimized production bundle.
// `npm run build:dev` (--mode development) -> unminified bundle with
// sourcemaps, for debugging what actually ships.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: mode === 'development' ? false : 'esbuild',
    sourcemap: mode === 'development',
  },
  server: {
    host: true,
    port: 3000,
  },
}));
