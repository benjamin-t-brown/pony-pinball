/**
 * One-off check: the generated perimeter + builder walls must reproduce the old
 * hand-written wall set exactly, minus the coincident duplicates that the
 * shared-boundary ownership rule is supposed to remove.
 *
 * Run: npx tsx scratch/verify-walls.ts
 */
import { buildLevel } from '../src/model/levels';
import { flattenSectionWalls } from '../src/model/Section';

// ---- the old hardcoded level, transcribed from git HEAD ----
const W = 400;
const H = 600;

const oldStart = (w: number, h: number) => {
  const lane = 372;
  return [
    [0, 0, 0, h],
    [w, 0, w, h],
    [0, 0, 150, 0],
    [250, 0, w, 0],
    [0, 400, 120, 440],
    [lane, 400, w - 110, 440],
    [lane, 540, lane, 600],
    [0, 500, lane, 530],
    [lane, h - 4, w, h - 4],
    [350, 200, 400, 280],
    [350, 200, 400, 190],
  ];
};
const oldUpper = (w: number, h: number) => [
  [0, 0, w, 0],
  [0, 0, 0, h],
  [0, h, 150, h],
  [250, h, w, h],
  [w, 0, w, 150],
  [w, 250, w, h],
];
const oldSide = (w: number, h: number) => [
  [0, 0, w, 0],
  [w, 0, w, h],
  [0, h, w, h],
  [0, 0, 0, 150],
  [0, 250, 0, h],
];

const oldSections = [
  { x: 0, y: 0, walls: oldStart(W, H) },
  { x: 0, y: -400, walls: oldUpper(400, 400) },
  { x: 400, y: -400, walls: oldSide(640, 400) },
];

/** Endpoint-order-independent key, so A->B and B->A compare equal. */
const key = (x1: number, y1: number, x2: number, y2: number) => {
  const a = `${x1},${y1}`;
  const b = `${x2},${y2}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};

const oldKeys: string[] = [];
for (const s of oldSections) {
  for (const w of s.walls) {
    oldKeys.push(key(w[0] + s.x, w[1] + s.y, w[2] + s.x, w[3] + s.y));
  }
}

const newKeys = flattenSectionWalls(buildLevel()).map(l =>
  key(l.a.x, l.a.y, l.b.x, l.b.y)
);

const count = (xs: string[]) => {
  const m = new Map<string, number>();
  for (const x of xs) m.set(x, (m.get(x) || 0) + 1);
  return m;
};

const oldCount = count(oldKeys);
const newCount = count(newKeys);

const dupOld = [...oldCount].filter(([, n]) => n > 1);
const dupNew = [...newCount].filter(([, n]) => n > 1);
const missing = [...oldCount.keys()].filter(k => !newCount.has(k));
const extra = [...newCount.keys()].filter(k => !oldCount.has(k));

console.log(`old walls:      ${oldKeys.length} (${oldCount.size} distinct)`);
console.log(`new walls:      ${newKeys.length} (${newCount.size} distinct)`);
console.log(`old duplicates: ${dupOld.length}`);
dupOld.forEach(([k, n]) => console.log(`   x${n}  ${k}`));
console.log(`new duplicates: ${dupNew.length}`);
dupNew.forEach(([k, n]) => console.log(`   x${n}  ${k}`));
console.log(`missing from new: ${missing.length}`);
missing.forEach(k => console.log(`   ${k}`));
console.log(`extra in new:     ${extra.length}`);
extra.forEach(k => console.log(`   ${k}`));

const ok =
  missing.length === 0 && extra.length === 0 && dupNew.length === 0;
console.log(ok ? '\nPASS' : '\nFAIL');
process.exit(ok ? 0 : 1);
