// @ts-nocheck
/**
 * Per-module size attribution.
 *
 * Concatenates and minifies the same way build.cjs does, then re-packs the
 * bundle once per source file with that file's contribution removed. The
 * difference is what the file actually costs in the shipped zip - which is not
 * the same as its source size, because Roadroller charges for novelty rather
 * than for bytes. A file full of text that resembles the rest of the bundle is
 * nearly free; a file of unique numbers is not.
 *
 * Run after `npm run tscompile` (it reads the emitted .js next to each .ts):
 *   node scripts/size-report.cjs
 */
const fs = require('fs');
const path = require('path');
const Terser = require('terser');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// zip/roadroller ratio measured on this project: the deflate pass after
// Roadroller recovers roughly a quarter of the packed size.
const ZIP_RATIO = 0.755;

const buildSrc = fs.readFileSync(path.join(__dirname, 'build.cjs'), 'utf8');
const RESERVED = JSON.parse(
  buildSrc
    .slice(
      buildSrc.indexOf('MANGLE_PROPS_RESERVED = [') +
        'MANGLE_PROPS_RESERVED = '.length,
      buildSrc.indexOf('];', buildSrc.indexOf('MANGLE_PROPS_RESERVED')) + 1
    )
    .replace(/'/g, '"')
    .replace(/,(\s*\])/g, '$1')
);

// Attribution runs with dead-code elimination OFF. With it on, removing an
// entry-point file makes everything it reaches unreachable, and Terser deletes
// the lot - so the file appears to "cost" the whole program. Disabling DCE
// keeps each removal local, which is what we want to attribute.
const NO_DCE = {
  unused: false,
  dead_code: false,
  side_effects: false,
  toplevel: false,
  pure_getters: false,
};

const TERSER_OPTS = {
  module: true,
  compress: {
    passes: 5,
    pure_getters: true,
    unsafe: true,
    unsafe_math: true,
    hoist_funs: true,
    toplevel: true,
    ecma: 9,
    drop_console: true,
  },
  mangle: {
    toplevel: true,
    properties: {
      builtins: false,
      keep_quoted: 'strict',
      reserved: RESERVED,
    },
  },
};

// --- the same concat logic build.cjs uses -----------------------------------

function sortByImports(filePaths) {
  const key = p => path.resolve(p);
  const known = new Map(filePaths.map(p => [key(p), p]));
  const deps = new Map();
  for (const p of filePaths) {
    const src = fs.readFileSync(p, 'utf8');
    const found = [];
    const re = /from\s*['"](\.[^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src))) {
      const base = path.resolve(path.dirname(p), m[1]);
      for (const cand of [base, base + '.js', base + '/index.js']) {
        if (known.has(key(cand))) {
          found.push(known.get(key(cand)));
          break;
        }
      }
    }
    deps.set(p, found);
  }
  const out = [];
  const mark = new Map();
  const visit = p => {
    if (mark.get(p)) return;
    mark.set(p, 1);
    for (const d of deps.get(p) || []) visit(d);
    mark.set(p, 2);
    out.push(p);
  };
  for (const p of filePaths) visit(p);
  return out;
}

function getAllFilePaths(dirPath, arr = []) {
  for (const file of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, file);
    if (fs.statSync(full).isDirectory()) getAllFilePaths(full, arr);
    else arr.push(full);
  }
  return arr.filter(p => /\.js$/.test(p));
}

function processCodeFile(text) {
  const lastLineInd = text.lastIndexOf('} from ');
  let endImportsInd = lastLineInd;
  if (lastLineInd > -1) {
    while (text[endImportsInd] !== '\n') endImportsInd++;
  }
  return text
    .slice(endImportsInd + 1)
    .replace(/export /g, '')
    .replace(/const /g, 'let ')
    .replace(/throw\s+new\s+Error\([^)]*\)/g, 'throw 1');
}

// ----------------------------------------------------------------------------

(async () => {
  const { Packer } = await import('roadroller');
  const rrOpts = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'roadroller-config.json'), 'utf8')
  );

  const files = sortByImports(getAllFilePaths(SRC));
  if (!files.length) {
    console.error('No .js found under src/. Run `npm run tscompile` first.');
    process.exit(1);
  }

  const pieces = files.map(f => processCodeFile(fs.readFileSync(f, 'utf8')));

  // html prelude, same shape build.cjs feeds to Roadroller
  const outJs = path.join(ROOT, 'output.js');
  let prelude = '';
  if (fs.existsSync(outJs)) {
    const out = fs.readFileSync(outJs, 'utf8');
    prelude = out.slice(0, out.indexOf("');") + 3);
  }

  async function packedSize(skipIndex, opts) {
    const code = pieces.filter((_, i) => i !== skipIndex).join('');
    let min;
    try {
      min = (await Terser.minify(code, opts)).code;
    } catch {
      return null;
    }
    const packer = new Packer(
      [{ data: prelude + min.trim(), type: 'js', action: 'eval' }],
      rrOpts
    );
    await packer.optimize(0);
    const { firstLine, secondLine } = packer.makeDecoder();
    return { packed: (firstLine + secondLine).length, min: min.length };
  }

  const shipped = await packedSize(-1, TERSER_OPTS);
  console.log(
    `\nshipped bundle: ${shipped.min} minified -> ${shipped.packed} packed ` +
      `(~${Math.round(shipped.packed * ZIP_RATIO)} zipped)`
  );

  const attrOpts = {
    ...TERSER_OPTS,
    compress: { ...TERSER_OPTS.compress, ...NO_DCE },
  };
  const base = await packedSize(-1, attrOpts);
  console.log(
    `attribution baseline (DCE off): ${base.min} minified -> ` +
      `${base.packed} packed\n`
  );

  const rows = [];
  for (let i = 0; i < files.length; i++) {
    const r = await packedSize(i, attrOpts);
    const rel = path.relative(ROOT, files[i]).replace(/\\/g, '/');
    if (!r) {
      rows.push([rel, pieces[i].length, null]);
      continue;
    }
    rows.push([rel, pieces[i].length, base.packed - r.packed]);
  }

  rows.sort((a, b) => (b[2] ?? -1) - (a[2] ?? -1));

  console.log(
    'module'.padEnd(38) +
      'src'.padStart(8) +
      'packed'.padStart(9) +
      'zip~'.padStart(8) +
      '  % of budget'
  );
  console.log('-'.repeat(78));
  let totalPacked = 0;
  for (const [rel, srcLen, cost] of rows) {
    if (cost === null) {
      console.log(rel.padEnd(38) + String(srcLen).padStart(8) + '   (failed)');
      continue;
    }
    totalPacked += cost;
    const zip = Math.round(cost * ZIP_RATIO);
    const pct = ((zip * 100) / 13312).toFixed(1);
    console.log(
      rel.padEnd(38) +
        String(srcLen).padStart(8) +
        String(cost).padStart(9) +
        String(zip).padStart(8) +
        '  ' +
        pct.padStart(5) +
        '%'
    );
  }
  console.log('-'.repeat(78));
  console.log(
    'sum of marginal costs'.padEnd(38) +
      ''.padStart(8) +
      String(totalPacked).padStart(9) +
      String(Math.round(totalPacked * ZIP_RATIO)).padStart(8)
  );
  console.log(
    '\nMarginal costs sum to less than the whole: shared structure between\n' +
      'modules is only charged once, so removing any single one saves less\n' +
      'than its face value.\n'
  );
})();
