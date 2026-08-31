import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { machinesApiPlugin } from './vite-plugin-machines';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, '..');

export default defineConfig({
  plugins: [react(), machinesApiPlugin(repoRoot)],
  resolve: {
    alias: {
      '@game': path.join(repoRoot, 'src'),
      planck: path.join(repoRoot, 'node_modules/planck'),
    },
  },
  server: {
    port: 7833,
    fs: {
      allow: [repoRoot],
    },
  },
});
