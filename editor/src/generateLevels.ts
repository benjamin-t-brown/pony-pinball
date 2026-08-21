import { LAUNCHER_X, LAUNCHER_Y } from '@game/model/constants';
import {
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_GATE_SECTION_4,
  TRIGGER_MOVE_DOOR,
} from '@game/model/Trigger';
import type { SectionData } from './types';

const BUILDER_NAMES: Record<number, string> = {
  0: 'B_WALLS',
  1: 'B_WALL_RESTI',
  2: 'B_LAUNCHER',
  3: 'B_WALL_GATE',
  4: 'B_FIELD',
  5: 'B_FLIPPER_LEFT',
  6: 'B_CIRCLE',
  7: 'B_CONVEYER',
  8: 'B_COLLECTABLE',
  9: 'B_FAN',
};

const TRIGGER_NAMES: Record<number, string> = {
  [TRIGGER_DEACTIVATE_WALL]: 'TRIGGER_DEACTIVATE_WALL',
  [TRIGGER_MOVE_DOOR]: 'TRIGGER_MOVE_DOOR',
  [TRIGGER_GATE_SECTION_4]: 'TRIGGER_GATE_SECTION_4',
};

const SIDE_NAMES = [
  'SECTION_SIDE_BOTTOM',
  'SECTION_SIDE_TOP',
  'SECTION_SIDE_LEFT',
  'SECTION_SIDE_RIGHT',
];

const formatNum = (n: number) => {
  if (Number.isInteger(n)) {
    return String(n);
  }
  const s = n.toFixed(4).replace(/\.?0+$/, '');
  return s;
};

const formatCall = (call: number[], indent: string) => {
  const id = call[0];
  const name = BUILDER_NAMES[id] || String(id);
  const args = call.slice(1);
  if (id === 0 && args.length > 8) {
    const lines = [`${indent}[`, `${indent}  ${name},`];
    for (let i = 0; i < args.length; i += 4) {
      const chunk = args.slice(i, i + 4).map(formatNum).join(', ');
      const comma = i + 4 < args.length ? ',' : '';
      lines.push(`${indent}  ${chunk}${comma}`);
    }
    lines.push(`${indent}]`);
    return lines.join('\n');
  }
  if (id === 4 || id === 8) {
    const trig = TRIGGER_NAMES[args[4]] || formatNum(args[4]);
    const nums = [
      ...args.slice(0, 4).map(formatNum),
      trig,
      ...args.slice(5).map(formatNum),
    ];
    return `${indent}[${[name, ...nums].join(', ')}]`;
  }
  return `${indent}[${[name, ...args.map(formatNum)].join(', ')}]`;
};

const roundCall = (call: number[]) => {
  const next = call.slice();
  if (next[0] === 0) {
    for (let i = 1; i < next.length; i++) {
      next[i] = Math.round(next[i]);
    }
    return next;
  }
  if (next[0] === 1 || next[0] === 3) {
    for (let i = 1; i <= 4 && i < next.length; i++) {
      next[i] = Math.round(next[i]);
    }
    if (next[0] === 3 && next.length > 5) {
      next[5] = Math.round(next[5]);
    }
    return next;
  }
  if (next[0] === 4 || next[0] === 8) {
    for (let i = 1; i < next.length; i++) {
      next[i] = Math.round(next[i]);
    }
    return next;
  }
  if (next[0] === 7) {
    for (let i = 1; i <= 4 && i < next.length; i++) {
      next[i] = Math.round(next[i]);
    }
    return next;
  }
  if (next.length > 1) {
    next[1] = Math.round(next[1]);
  }
  if (next.length > 2) {
    next[2] = Math.round(next[2]);
  }
  return next;
};

const roundStart = (start?: number[] | { x: number; y: number } | null) => {
  if (!start) {
    return [LAUNCHER_X, LAUNCHER_Y];
  }
  if (Array.isArray(start)) {
    return [Math.round(start[0]), Math.round(start[1])];
  }
  return [Math.round(start.x), Math.round(start.y)];
};

export const roundLevel = (
  sections: SectionData[],
  links: number[][],
  start?: number[] | { x: number; y: number } | null
): { sections: SectionData[]; links: number[][]; start: number[] } => {
  return {
    sections: sections.map(s => [
      Math.round(s[0]),
      Math.round(s[1]),
      Math.round(s[2]),
      Math.round(s[3]),
      s[4],
      s[5].map(roundCall),
    ]),
    links: links.map(l => [l[0], l[1], Math.round(l[2]), Math.round(l[3])]),
    start: roundStart(start),
  };
};

export const generateLevelsTs = (
  sections: SectionData[],
  links: number[][],
  start?: number[] | { x: number; y: number } | null
): string => {
  const rounded = roundLevel(sections, links, start);
  sections = rounded.sections;
  links = rounded.links;
  const spawn = rounded.start;
  const builderNames = new Set<string>();
  const sideNames = new Set<string>();
  const triggerNames = new Set<string>();
  for (const section of sections) {
    for (const call of section[5]) {
      const name = BUILDER_NAMES[call[0]];
      if (name) {
        builderNames.add(name);
      }
      if (call[0] === 4 || call[0] === 8) {
        const trig = TRIGGER_NAMES[call[5]];
        if (trig) {
          triggerNames.add(trig);
        }
      }
    }
  }
  for (const link of links) {
    const name = SIDE_NAMES[link[1]];
    if (name) {
      sideNames.add(name);
    }
  }

  const imports = [...builderNames, ...sideNames].sort();
  const importBlock =
    (imports.length > 0
      ? `import {\n  ${imports.join(',\n  ')},\n} from './model/builders';\n`
      : `import {} from './model/builders';\n`) +
    (triggerNames.size > 0
      ? `import {\n  ${[...triggerNames].sort().join(',\n  ')},\n} from './model/Trigger';\n`
      : '');

  const sectionLines: string[] = [];
  for (const s of sections) {
    const calls = s[5];
    if (calls.length === 0) {
      sectionLines.push(
        `  [${formatNum(s[0])}, ${formatNum(s[1])}, ${formatNum(s[2])}, ${formatNum(s[3])}, ${s[4]}, []],`
      );
      continue;
    }
    const callStr = calls.map(c => formatCall(c, '      ')).join(',\n');
    sectionLines.push(
      `  [
    ${formatNum(s[0])},
    ${formatNum(s[1])},
    ${formatNum(s[2])},
    ${formatNum(s[3])},
    ${s[4]},
    [
${callStr},
    ],
  ],`
    );
  }

  const linkLines = links.map(l => {
    const side = SIDE_NAMES[l[1]] || String(l[1]);
    return `  [${l[0]}, ${side}, ${formatNum(l[2])}, ${formatNum(l[3])}],`;
  });

  return `${importBlock}
export type SectionData = [
  number,
  number,
  number,
  number,
  number,
  number[][],
];

/**
 * x, y, w, h, bg, builder calls.
 * Generated by the editor.
 */
export const SECTIONS: SectionData[] = [
${sectionLines.join('\n')}
];

/** section, side, localOffset, width */
export const LINKS: number[][] = [
${linkLines.join('\n')}
];

/** world x, y */
export const START = [${formatNum(spawn[0])}, ${formatNum(spawn[1])}];
`;
};
