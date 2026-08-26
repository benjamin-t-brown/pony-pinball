import { LAUNCHER_CHARGE_MS, LAUNCHER_FORCE, LAUNCHER_LEN, LAUNCHER_RANGE, LAUNCHER_X, LAUNCHER_Y, LEFT_REST_ANGLE, LEFT_UP, PADDLE_LEN } from '@game/model/constants';
import { roundAngle } from './geometry';
import {
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_GATE_SECTION_4,
  TRIGGER_MOVE_BALL,
  TRIGGER_MOVE_DOOR,
  TRIGGER_PLAY_SOUND,
} from '@game/model/Trigger';
import {
  DEC_BLINKING_LIGHT,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
  SHAPE_CHEVRON,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
  TEX_PALETTE,
} from '@game/model/parts/Decoration';
import {
  CIRCLE_DIAMOND,
  CIRCLE_SMILE,
  CIRCLE_STAR,
} from '@game/model/parts/Obstacle';
import { SOUND_DEFS } from './schema';
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
  10: 'B_PORTAL',
  11: 'B_TRIANGLE',
  12: 'B_DECORATION',
};

const DEC_NAMES: Record<number, string> = {
  [DEC_BLINKING_LIGHT]: 'DEC_BLINKING_LIGHT',
  [DEC_BLINKING_LIGHT_LINE]: 'DEC_BLINKING_LIGHT_LINE',
  [DEC_ICON]: 'DEC_ICON',
  [DEC_RAINBOW]: 'DEC_RAINBOW',
};

const SHAPE_NAMES: Record<number, string> = {
  [SHAPE_CHEVRON]: 'SHAPE_CHEVRON',
  [SHAPE_CIRCLE]: 'SHAPE_CIRCLE',
  [SHAPE_SQUARE]: 'SHAPE_SQUARE',
};

const CIRCLE_ICON_NAMES: Record<number, string> = {
  [CIRCLE_SMILE]: 'CIRCLE_SMILE',
  [CIRCLE_STAR]: 'CIRCLE_STAR',
  [CIRCLE_DIAMOND]: 'CIRCLE_DIAMOND',
};

const TRIGGER_NAMES: Record<number, string> = {
  [TRIGGER_DEACTIVATE_WALL]: 'TRIGGER_DEACTIVATE_WALL',
  [TRIGGER_MOVE_DOOR]: 'TRIGGER_MOVE_DOOR',
  [TRIGGER_GATE_SECTION_4]: 'TRIGGER_GATE_SECTION_4',
  [TRIGGER_ACTIVATE_LIGHT]: 'TRIGGER_ACTIVATE_LIGHT',
  [TRIGGER_MOVE_BALL]: 'TRIGGER_MOVE_BALL',
  [TRIGGER_PLAY_SOUND]: 'TRIGGER_PLAY_SOUND',
};

const SOUND_NAMES: Record<number, string> = {};
for (let i = 0; i < SOUND_DEFS.length; i++) {
  SOUND_NAMES[SOUND_DEFS[i].id] = SOUND_DEFS[i].key;
}

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
    const extra = args.slice(5).map((n, i) => {
      if (args[4] === TRIGGER_PLAY_SOUND && i === 0) {
        return SOUND_NAMES[n] || formatNum(n);
      }
      return formatNum(n);
    });
    const nums = [
      ...args.slice(0, 4).map(formatNum),
      trig,
      ...extra,
    ];
    return `${indent}[${[name, ...nums].join(', ')}]`;
  }
  if (id === 6 && args.length > 8) {
    const icon = CIRCLE_ICON_NAMES[args[8]] || formatNum(args[8]);
    const nums = [
      ...args.slice(0, 8).map(formatNum),
      icon,
      ...args.slice(9).map(formatNum),
    ];
    return `${indent}[${[name, ...nums].join(', ')}]`;
  }
  if (id === 12) {
    const dec = DEC_NAMES[args[4]] || formatNum(args[4]);
    const tex =
      args[5] === TEX_PALETTE ? 'TEX_PALETTE' : formatNum(args[5]);
    if (args[4] === DEC_ICON) {
      const nums = [
        ...args.slice(0, 4).map(formatNum),
        dec,
        tex,
        ...args.slice(6).map(formatNum),
      ];
      return `${indent}[${[name, ...nums].join(', ')}]`;
    }
    if (args[4] === DEC_RAINBOW) {
      const nums = [
        ...args.slice(0, 4).map(formatNum),
        dec,
        formatNum(args[5]),
        ...args.slice(6).map(formatNum),
      ];
      return `${indent}[${[name, ...nums].join(', ')}]`;
    }
    if (args[4] === DEC_BLINKING_LIGHT) {
      const nums = [
        ...args.slice(0, 4).map(formatNum),
        dec,
        tex,
      ];
      if (args.length > 6) {
        nums.push(SHAPE_NAMES[args[6]] || formatNum(args[6]));
        for (let i = 7; i < args.length; i++) {
          nums.push(formatNum(args[i]));
        }
      }
      return `${indent}[${[name, ...nums].join(', ')}]`;
    }
    const nums = [
      ...args.slice(0, 4).map(formatNum),
      dec,
      tex,
    ];
    if (args.length > 6) {
      nums.push(formatNum(args[6]));
    }
    if (args.length > 7) {
      nums.push(SHAPE_NAMES[args[7]] || formatNum(args[7]));
      for (let i = 8; i < args.length; i++) {
        nums.push(formatNum(args[i]));
      }
    }
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
  if (next[0] === 10) {
    for (let i = 1; i <= 4 && i < next.length; i++) {
      next[i] = Math.round(next[i]);
    }
    if (next.length > 5) {
      next[5] = Math.round(next[5]);
    }
    if (next.length > 6) {
      next[6] = Math.round(next[6]);
    }
    return next;
  }
  if (next[0] === 11) {
    if (next.length > 1) {
      next[1] = Math.round(next[1]);
    }
    if (next.length > 2) {
      next[2] = Math.round(next[2]);
    }
    if (next.length > 3) {
      next[3] = Math.round(next[3]);
    }
    if (next.length > 4) {
      next[4] = Math.round(next[4]);
    }
    if (next.length > 5) {
      next[5] = roundAngle(next[5]);
    }
    if (next.length > 9) {
      next[9] = Math.round(next[9]);
    }
    return next;
  }
  if (next[0] === 12) {
    if (next.length > 1) {
      next[1] = Math.round(next[1]);
    }
    if (next.length > 2) {
      next[2] = Math.round(next[2]);
    }
    if (next.length > 4) {
      next[4] = roundAngle(next[4]);
    }
    if (next.length > 5) {
      next[5] = Math.round(next[5]);
    }
    if (next.length > 6) {
      next[6] = Math.round(next[6]);
    }
    if ((next[5] | 0) !== DEC_ICON && next.length > 7) {
      next[7] = Math.round(next[7]);
    }
    if ((next[5] | 0) !== DEC_ICON && next.length > 8) {
      next[8] = Math.round(next[8]);
    }
    if (next.length > 9) {
      next[9] = Math.round(next[9]);
    }
    if (next.length > 10) {
      next[10] = Math.round(next[10]);
    }
    if (next.length > 11) {
      next[11] = Math.round(next[11]);
    }
    if (next.length > 12) {
      next[12] = Math.round(next[12]);
    }
    if (next.length > 13) {
      next[13] = Math.round(next[13]);
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
    if (next.length > 5) {
      next[5] = roundAngle(next[5]);
    }
    return next;
  }
  if (next[0] === 5) {
    if (next.length > 1) {
      next[1] = Math.round(next[1]);
    }
    if (next.length > 2) {
      next[2] = Math.round(next[2]);
    }
    if (next.length > 3) {
      next[3] = roundAngle(next[3]);
    }
    if (next.length > 4) {
      next[4] = roundAngle(next[4]);
    }
    return next;
  }
  if (next[0] === 2) {
    if (next.length > 1) {
      next[1] = Math.round(next[1]);
    }
    if (next.length > 2) {
      next[2] = Math.round(next[2]);
    }
    if (next.length > 3) {
      next[3] = roundAngle(next[3]);
    }
    if (next.length > 4) {
      next[4] = roundAngle(next[4]);
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
      s[4].map(roundCall),
    ]),
    links: links.map(l => [l[0], l[1], Math.round(l[2]), Math.round(l[3])]),
    start: roundStart(start),
  };
};

const trimCall = (call: number[]) => {
  const next = call.slice();
  const defs: (number | undefined)[] = [];
  if (next[0] === 5) {
    defs[3] = LEFT_REST_ANGLE;
    defs[4] = LEFT_UP;
    defs[5] = 0;
    defs[6] = PADDLE_LEN;
  } else if (next[0] === 2) {
    defs[3] = 0;
    defs[4] = -1;
    defs[5] = LAUNCHER_FORCE;
    defs[6] = LAUNCHER_RANGE;
    defs[7] = LAUNCHER_CHARGE_MS;
    defs[8] = LAUNCHER_LEN;
  } else if (next[0] === 6) {
    defs[6] = 0;
    defs[7] = 0;
    defs[8] = 0;
    defs[9] = 0;
    defs[10] = 0;
  } else if (next[0] === 9) {
    defs[7] = 0;
    defs[8] = 0;
  } else if (next[0] === 11) {
    defs[6] = 0.5;
    defs[7] = 0.5;
    defs[8] = 0.5;
    defs[9] = 0;
  } else if (next[0] === 12) {
    const type = next[5] | 0;
    if (type === DEC_BLINKING_LIGHT) {
      defs[7] = SHAPE_CHEVRON;
      defs[8] = 1;
      defs[9] = 1000;
    } else if (type === DEC_BLINKING_LIGHT_LINE) {
      defs[7] = 400;
      defs[8] = SHAPE_CHEVRON;
      defs[12] = 0;
      defs[13] = 1;
    } else if (type === DEC_ICON) {
      defs[7] = 1;
    }
  }
  while (
    next.length > 3 &&
    defs[next.length - 1] !== undefined &&
    next[next.length - 1] === defs[next.length - 1]
  ) {
    next.pop();
  }
  return next;
};

export const generateLevelsTs = (
  sections: SectionData[],
  links: number[][],
  start?: number[] | { x: number; y: number } | null
): string => {
  const rounded = roundLevel(sections, links, start);
  sections = rounded.sections.map(s => [
    s[0],
    s[1],
    s[2],
    s[3],
    s[4].map(trimCall),
  ]) as SectionData[];
  links = rounded.links;
  const spawn = rounded.start;
  const builderNames = new Set<string>();
  const sideNames = new Set<string>();
  const triggerNames = new Set<string>();
  const soundNames = new Set<string>();
  const decNames = new Set<string>();
  const circleIconNames = new Set<string>();
  for (const section of sections) {
    for (const call of section[4]) {
      const name = BUILDER_NAMES[call[0]];
      if (name) {
        builderNames.add(name);
      }
      if (call[0] === 4 || call[0] === 8) {
        const trig = TRIGGER_NAMES[call[5]];
        if (trig) {
          triggerNames.add(trig);
        }
        if (call[5] === TRIGGER_PLAY_SOUND) {
          const sound = SOUND_NAMES[call[6]];
          if (sound) {
            soundNames.add(sound);
          }
        }
      }
      if (call[0] === 6 && call.length > 9) {
        const icon = CIRCLE_ICON_NAMES[call[9]];
        if (icon) {
          circleIconNames.add(icon);
        }
      }
      if (call[0] === 12) {
        const dec = DEC_NAMES[call[5]];
        if (dec) {
          decNames.add(dec);
        }
        if ((call[5] | 0) !== DEC_ICON && (call[5] | 0) !== DEC_RAINBOW) {
          const shapeIdx =
            (call[5] | 0) === DEC_BLINKING_LIGHT ? 7 : 8;
          const shape = SHAPE_NAMES[call[shapeIdx]];
          if (shape) {
            decNames.add(shape);
          }
          if (call[6] === TEX_PALETTE) {
            decNames.add('TEX_PALETTE');
          }
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
      : '') +
    (decNames.size > 0
      ? `import {\n  ${[...decNames].sort().join(',\n  ')},\n} from './model/parts/Decoration';\n`
      : '') +
    (circleIconNames.size > 0
      ? `import {\n  ${[...circleIconNames].sort().join(',\n  ')},\n} from './model/parts/Obstacle';\n`
      : '') +
    (soundNames.size > 0
      ? `import {\n  ${[...soundNames].sort().join(',\n  ')},\n} from './zzfx.js';\n`
      : '');

  const sectionLines: string[] = [];
  for (const s of sections) {
    const calls = s[4];
    if (calls.length === 0) {
      sectionLines.push(
        `  [${formatNum(s[0])}, ${formatNum(s[1])}, ${formatNum(s[2])}, ${formatNum(s[3])}, []],`
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
  number[][],
];

/**
 * x, y, w, h, builder calls.
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
