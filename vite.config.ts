import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, normalizePath } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));

const sanitizeMachineId = (id: string) => {
  const next = id.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  return next.replace(/^-+|-+$/g, '');
};

const machineFileStem = (id: string) => {
  return sanitizeMachineId(id)
    .split(/[-_]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const requested = sanitizeMachineId(
  process.env.MACHINE || process.env.npm_config_machine || ''
);

const stem = requested ? machineFileStem(requested) : '';
const machineFile = path.resolve(dir, 'src/tables', `${stem}.ts`);

if (requested === 'current') {
  throw new Error('MACHINE=current is reserved; pass a table id');
}

if (requested && !fs.existsSync(machineFile)) {
  throw new Error(`Unknown machine "${requested}". Expected ${machineFile}`);
}

export default defineConfig({
  server: {
    port: 7832,
  },
  resolve: requested
    ? {
        alias: [
          {
            find: /[/\\]tables[/\\]Current\.ts$/,
            replacement: normalizePath(machineFile),
          },
        ],
      }
    : undefined,
});
