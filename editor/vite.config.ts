import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { levelsApiPlugin } from './vite-plugin-levels';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, '..');

export default defineConfig({
  plugins: [react(), levelsApiPlugin(repoRoot)],
  resolve: {
    alias: {
      '@game': path.join(repoRoot, 'src'),
    },
  },
  server: {
    port: 7833,
    fs: {
      allow: [repoRoot],
    },
  },
});
