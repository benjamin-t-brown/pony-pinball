const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SECONDS = Number(process.argv[2] || 600);
const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'node_modules/roadroller/cli.mjs');
const INPUT = path.join(ROOT, 'output.js');
const LOG = path.join(__dirname, 'rr-search.log');
const PACKED = path.join(__dirname, 'rr-search-packed.js');
const CANDIDATE = path.join(__dirname, 'roadroller-config.candidate.json');
const CURRENT = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'roadroller-config.json'), 'utf8')
);

const cliToApiMaps = [
  { cli: '-Zab', api: 'numAbbreviations', type: 'number' },
  { cli: '-Zlr', api: 'recipLearningRate', type: 'number' },
  { cli: '-Zmc', api: 'modelMaxCount', type: 'number' },
  { cli: '-Zmd', api: 'modelRecipBaseCount', type: 'number' },
  { cli: '-Zpr', api: 'precision', type: 'number' },
  { cli: '-Zdy', api: 'dynamicModels', type: 'number' },
  { cli: '-Zco', api: 'contextBits', type: 'number' },
  { cli: '-S', api: 'sparseSelectors', type: 'array' },
];

const convertValue = (mapper, cliSetting) => {
  const stringValue = cliSetting.replace(mapper.cli, '');
  if (mapper.type === 'number') {
    return parseInt(stringValue, 10);
  }
  return stringValue.split(',').map(value => parseInt(value, 10));
};

const parseConfigLine = line => {
  const best = { allowFreeVars: true };
  const flagged = line.match(/use `([^`]+)`/);
  const afterParen = line.includes(') ') ? line.split(') ')[1] : '';
  const flagSrc = flagged
    ? flagged[1]
    : afterParen.split(': ')[0];
  const pieces = flagSrc
    .trim()
    .split(/\s+/)
    .filter(param => param.startsWith('-') && !param.startsWith('-Sx'));
  for (const singleParam of pieces) {
    for (const mapper of cliToApiMaps) {
      if (singleParam.startsWith(mapper.cli)) {
        if (mapper.cli === '-S' && singleParam.startsWith('-Sx')) {
          continue;
        }
        best[mapper.api] = convertValue(mapper, singleParam);
      }
    }
  }
  const sizeMatch = line.match(/:\s+(\d+)/);
  const size = sizeMatch ? Number(sizeMatch[1]) : null;
  return { best, size, line };
};

const args = [
  CLI,
  INPUT,
  '-D',
  '-OO',
  `-Zab${CURRENT.numAbbreviations}`,
  `-Zlr${CURRENT.recipLearningRate}`,
  `-Zmc${CURRENT.modelMaxCount}`,
  `-Zmd${CURRENT.modelRecipBaseCount}`,
  `-S${CURRENT.sparseSelectors.join(',')}`,
  '-o',
  PACKED,
];

console.log(`Searching ${SECONDS}s from current config...`);
console.log(`node ${args.join(' ')}`);

const log = fs.createWriteStream(LOG);
let stderr = '';
const child = spawn(process.execPath, args, {
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

child.stderr.on('data', d => {
  const s = d.toString();
  stderr += s;
  process.stderr.write(s);
  log.write(s);
});
child.stdout.on('data', d => {
  log.write(d);
});

let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  console.error(`\n--- ${SECONDS}s elapsed, interrupting search ---\n`);
  child.kill('SIGINT');
  setTimeout(() => {
    if (!child.killed) {
      child.kill();
    }
  }, 20000);
}, SECONDS * 1000);

child.on('exit', (code, signal) => {
  clearTimeout(timer);
  log.end();
  const lines = stderr.split(/\r?\n/);
  const replicate = [...lines].reverse().find(l => l.includes('to replicate'));
  const bestLine =
    replicate || [...lines].reverse().find(l => l.includes('<-'));
  if (!bestLine) {
    console.error('No Roadroller progress line found. See', LOG);
    process.exit(1);
  }
  const parsed = parseConfigLine(bestLine);
  fs.writeFileSync(CANDIDATE, JSON.stringify(parsed.best, null, 2) + '\n');
  console.log(timedOut ? 'search interrupted' : `exited ${code} ${signal || ''}`);
  console.log('BEST LINE:', bestLine.trim());
  console.log('CANDIDATE:', JSON.stringify(parsed.best, null, 2));
  console.log('EST SIZE:', parsed.size);
  process.exit(0);
});
