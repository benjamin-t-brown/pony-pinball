// @ts-nocheck

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(dir, '../../regem-ludos/iframes');
const dst = path.resolve(dir, '../lib2');

if (!fs.existsSync(src)) {
  console.error('Expected sibling repo at', src);
  process.exit(1);
}

fs.mkdirSync(path.join(dst, 'lib2'), { recursive: true });
fs.mkdirSync(path.join(dst, 'assets'), { recursive: true });
fs.copyFileSync(path.join(src, 'lib2.mjs'), path.join(dst, 'lib2.mjs'));
fs.copyFileSync(path.join(src, 'lib2.css'), path.join(dst, 'lib2.css'));
fs.copyFileSync(path.join(src, 'lib2.types.ts'), path.join(dst, 'lib2.types.ts'));
for (const name of fs.readdirSync(path.join(src, 'lib2'))) {
  fs.copyFileSync(path.join(src, 'lib2', name), path.join(dst, 'lib2', name));
}
for (const name of fs.readdirSync(path.join(src, 'assets'))) {
  if (name.endsWith('.svg')) {
    fs.copyFileSync(path.join(src, 'assets', name), path.join(dst, 'assets', name));
  }
}
const menuPath = path.join(dst, 'lib2', 'menu.mjs');
const menu = fs.readFileSync(menuPath, 'utf8').replaceAll('../../../assets/', '/lib2/assets/');
fs.writeFileSync(menuPath, menu);
console.log('Copied lib2 from', src);
