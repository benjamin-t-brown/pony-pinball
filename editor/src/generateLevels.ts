import {
  B_CIRCLE,
  B_COLLECTABLE,
  B_CONVEYER,
  B_DECORATION,
  B_FAN,
  B_FIELD,
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_PORTAL,
  B_TRIANGLE,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_PLAY_SOUND,
  DEC_BLINKING_LIGHT,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
  cloneCall,
  type MachineCall,
  type WallSegment,
} from '@game/machine/MachineCalls';
import {
  LAUNCHER_CHARGE_MS,
  LAUNCHER_FORCE,
  LAUNCHER_LEN,
  LAUNCHER_RANGE,
  LAUNCHER_X,
  LAUNCHER_Y,
  LEFT_REST_ANGLE,
  LEFT_UP,
  PADDLE_LEN,
} from '@game/model/constants';
import { roundAngle } from './geometry';
import {
  assembleMachine,
  linksToTuples,
  PONY_MACHINE_META,
  sectionsToTuples,
} from '@game/machine/MachineFormats';
import type { Machine } from '@game/machine/MachineTypes';
import {
  GOAL_PACHINKO,
  GOAL_PINBALL,
  GOAL_SECTION,
  goalOf,
} from '@game/machine/MachineGoals';
import {
  SHAPE_CHEVRON,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
  TEX_PALETTE,
} from '@game/model/parts/Decoration';
import { CIRCLE_DIAMOND, CIRCLE_SMILE } from '@game/model/parts/Obstacle';
import { SOUND_DEFS } from './schema';
import type { SectionData } from './types';

const KIND_NAMES: Record<number, string> = {
  [B_WALLS]: 'B_WALLS',
  [B_WALL_RESTI]: 'B_WALL_RESTI',
  [B_LAUNCHER]: 'B_LAUNCHER',
  [B_WALL_GATE]: 'B_WALL_GATE',
  [B_FIELD]: 'B_FIELD',
  [B_FLIPPER_LEFT]: 'B_FLIPPER_LEFT',
  [B_CIRCLE]: 'B_CIRCLE',
  [B_CONVEYER]: 'B_CONVEYER',
  [B_COLLECTABLE]: 'B_COLLECTABLE',
  [B_FAN]: 'B_FAN',
  [B_PORTAL]: 'B_PORTAL',
  [B_TRIANGLE]: 'B_TRIANGLE',
  [B_DECORATION]: 'B_DECORATION',
};

const SHAPE_NAMES: Record<number, string> = {
  [SHAPE_CHEVRON]: 'SHAPE_CHEVRON',
  [SHAPE_CIRCLE]: 'SHAPE_CIRCLE',
  [SHAPE_SQUARE]: 'SHAPE_SQUARE',
};

const CIRCLE_ICON_NAMES: Record<number, string> = {
  [CIRCLE_SMILE]: 'CIRCLE_SMILE',
  [CIRCLE_DIAMOND]: 'CIRCLE_DIAMOND',
};

const TRIGGER_NAMES: Record<number, string> = {
  [TRIGGER_DEACTIVATE_WALL]: 'TRIGGER_DEACTIVATE_WALL',
  [TRIGGER_ACTIVATE_LIGHT]: 'TRIGGER_ACTIVATE_LIGHT',
  [TRIGGER_PLAY_SOUND]: 'TRIGGER_PLAY_SOUND',
};

const DEC_NAMES: Record<number, string> = {
  [DEC_BLINKING_LIGHT]: 'DEC_BLINKING_LIGHT',
  [DEC_BLINKING_LIGHT_LINE]: 'DEC_BLINKING_LIGHT_LINE',
  [DEC_ICON]: 'DEC_ICON',
  [DEC_RAINBOW]: 'DEC_RAINBOW',
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

const roundIntKeys = (call: MachineCall, keys: string[]) => {
  const rec = call as unknown as Record<string, unknown>;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (typeof rec[k] === 'number') {
      rec[k] = Math.round(rec[k] as number);
    }
  }
};

const roundAngleKeys = (call: MachineCall, keys: string[]) => {
  const rec = call as unknown as Record<string, unknown>;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (typeof rec[k] === 'number') {
      rec[k] = roundAngle(rec[k] as number);
    }
  }
};

const roundCall = (call: MachineCall): MachineCall => {
  const next = cloneCall(call);
  if (next.kind === B_WALLS) {
    for (let i = 0; i < next.segments.length; i++) {
      const s = next.segments[i];
      s.x0 = Math.round(s.x0);
      s.y0 = Math.round(s.y0);
      s.x1 = Math.round(s.x1);
      s.y1 = Math.round(s.y1);
      if (s.id != null) {
        s.id = Math.round(s.id);
      }
    }
    return next;
  }
  if (next.kind === B_WALL_RESTI || next.kind === B_WALL_GATE || next.kind === B_PORTAL) {
    roundIntKeys(next, ['x0', 'y0', 'x1', 'y1', 'id', 'color']);
    return next;
  }
  if (next.kind === B_FIELD || next.kind === B_COLLECTABLE) {
    roundIntKeys(next, [
      'x',
      'y',
      'w',
      'h',
      'id',
      'wall',
      'part',
      'sound',
      'onDelay',
      'offDelay',
    ]);
    return next;
  }
  if (next.kind === B_CONVEYER) {
    roundIntKeys(next, ['x', 'y', 'w', 'h', 'id']);
    roundAngleKeys(next, ['angle']);
    return next;
  }
  if (next.kind === B_FLIPPER_LEFT) {
    roundIntKeys(next, ['x', 'y', 'id']);
    roundAngleKeys(next, ['restAngle', 'upAngle']);
    return next;
  }
  if (next.kind === B_LAUNCHER) {
    roundIntKeys(next, ['x', 'y', 'id']);
    roundAngleKeys(next, ['dx', 'dy']);
    return next;
  }
  if (next.kind === B_TRIANGLE) {
    roundIntKeys(next, ['x', 'y', 'sideLen1', 'sideLen2', 'id0', 'id1', 'id2']);
    roundAngleKeys(next, ['rot']);
    return next;
  }
  if (next.kind === B_DECORATION) {
    roundIntKeys(next, [
      'x',
      'y',
      'id',
      'texture',
      'shape',
      'startOn',
      'count',
      'delay',
      'interval',
      'x1',
      'y1',
      'w',
      'h',
    ]);
    roundAngleKeys(next, ['rot']);
    return next;
  }
  roundIntKeys(next, ['x', 'y', 'id']);
  return next;
};

const omitIf = (obj: Record<string, unknown>, key: string, value: unknown) => {
  if (obj[key] === value || obj[key] === undefined) {
    delete obj[key];
  }
};

const trimCall = (call: MachineCall): MachineCall => {
  const next = cloneCall(call);
  const rec = next as unknown as Record<string, unknown>;
  omitIf(rec, 'opacity', 1);
  omitIf(rec, 'id', 0);
  if (next.kind === B_FLIPPER_LEFT) {
    omitIf(rec, 'restAngle', LEFT_REST_ANGLE);
    omitIf(rec, 'upAngle', LEFT_UP);
    omitIf(rec, 'flipped', false);
    omitIf(rec, 'length', PADDLE_LEN);
  }
  if (next.kind === B_LAUNCHER) {
    omitIf(rec, 'dx', 0);
    omitIf(rec, 'dy', -1);
    omitIf(rec, 'force', LAUNCHER_FORCE);
    omitIf(rec, 'range', LAUNCHER_RANGE);
    omitIf(rec, 'chargeMs', LAUNCHER_CHARGE_MS);
    omitIf(rec, 'length', LAUNCHER_LEN);
  }
  if (next.kind === B_CIRCLE) {
    omitIf(rec, 'dx', 0);
    omitIf(rec, 'dy', 0);
    omitIf(rec, 'omega', 0);
    omitIf(rec, 'icon', 0);
    omitIf(rec, 'color', 0);
  }
  if (next.kind === B_TRIANGLE) {
    omitIf(rec, 'resti0', 0.5);
    omitIf(rec, 'resti1', 0.5);
    omitIf(rec, 'resti2', 0.5);
  }
  if (next.kind === B_DECORATION) {
    omitIf(rec, 'scale', 1);
    omitIf(rec, 'rot', 0);
    omitIf(rec, 'texture', 0);
    if (next.decoration === DEC_BLINKING_LIGHT) {
      omitIf(rec, 'shape', SHAPE_CHEVRON);
      omitIf(rec, 'startOn', 1);
      omitIf(rec, 'interval', 1000);
    }
    if (next.decoration === DEC_BLINKING_LIGHT_LINE) {
      omitIf(rec, 'interval', 400);
      omitIf(rec, 'shape', SHAPE_CHEVRON);
      omitIf(rec, 'delay', 0);
      omitIf(rec, 'startOn', 1);
    }
    if (next.decoration === DEC_ICON) {
      omitIf(rec, 'opacity', 1);
    }
  }
  if (next.kind === B_WALLS) {
    for (let i = 0; i < next.segments.length; i++) {
      if (next.segments[i].id === 0) {
        delete next.segments[i].id;
      }
    }
  }
  return next;
};

const formatSeg = (s: WallSegment) => {
  const id = s.id ? `, id: ${formatNum(s.id)}` : '';
  return `{ x0: ${formatNum(s.x0)}, y0: ${formatNum(s.y0)}, x1: ${formatNum(s.x1)}, y1: ${formatNum(s.y1)}${id} }`;
};

const formatValue = (
  key: string,
  value: unknown,
  call: MachineCall,
  used: {
    kinds: Set<string>;
    triggers: Set<string>;
    decs: Set<string>;
    shapes: Set<string>;
    icons: Set<string>;
    sounds: Set<string>;
    tex: boolean;
  }
): string => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value !== 'number') {
    return String(value);
  }
  if (key === 'trigger') {
    const name = TRIGGER_NAMES[value];
    if (name) {
      used.triggers.add(name);
      return name;
    }
  }
  if (key === 'decoration') {
    const name = DEC_NAMES[value];
    if (name) {
      used.decs.add(name);
      return name;
    }
  }
  if (key === 'shape') {
    const name = SHAPE_NAMES[value];
    if (name) {
      used.shapes.add(name);
      return name;
    }
  }
  if (key === 'icon' && call.kind === B_CIRCLE) {
    const name = CIRCLE_ICON_NAMES[value];
    if (name) {
      used.icons.add(name);
      return name;
    }
  }
  if (key === 'texture' && value === TEX_PALETTE) {
    used.tex = true;
    return 'TEX_PALETTE';
  }
  if (key === 'sound') {
    const name = SOUND_NAMES[value];
    if (name) {
      used.sounds.add(name);
      return name;
    }
  }
  return formatNum(value);
};

const formatCall = (
  call: MachineCall,
  indent: string,
  used: {
    kinds: Set<string>;
    triggers: Set<string>;
    decs: Set<string>;
    shapes: Set<string>;
    icons: Set<string>;
    sounds: Set<string>;
    tex: boolean;
  }
) => {
  if (call.kind === B_WALLS) {
    used.kinds.add('B_WALLS');
    if (call.segments.length === 0) {
      return `${indent}{ kind: B_WALLS, segments: [] }`;
    }
    const lines = [`${indent}{`, `${indent}  kind: B_WALLS,`, `${indent}  segments: [`];
    for (let i = 0; i < call.segments.length; i++) {
      const comma = i + 1 < call.segments.length ? ',' : '';
      lines.push(`${indent}    ${formatSeg(call.segments[i])}${comma}`);
    }
    lines.push(`${indent}  ],`, `${indent}}`);
    return lines.join('\n');
  }
  const rec = call as unknown as Record<string, unknown>;
  const keys = Object.keys(rec).filter(k => rec[k] !== undefined && k !== 'kind');
  const kindName = KIND_NAMES[call.kind] || String(call.kind);
  used.kinds.add(kindName);
  const parts = [`kind: ${kindName}`];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    parts.push(`${k}: ${formatValue(k, rec[k], call, used)}`);
  }
  return `${indent}{ ${parts.join(', ')} }`;
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

export const generateMachineTs = (machine: Machine): string => {
  const rounded = roundLevel(
    sectionsToTuples(machine.sections),
    linksToTuples(machine.links),
    [machine.start.x, machine.start.y]
  );
  const sections = rounded.sections.map(s => [
    s[0],
    s[1],
    s[2],
    s[3],
    s[4].map(trimCall),
  ]) as SectionData[];
  const links = rounded.links;
  const spawn = rounded.start;
  const used = {
    kinds: new Set<string>(),
    triggers: new Set<string>(),
    decs: new Set<string>(),
    shapes: new Set<string>(),
    icons: new Set<string>(),
    sounds: new Set<string>(),
    tex: false,
  };
  const sideNames = new Set<string>();
  const callStrs: string[][] = [];
  for (const section of sections) {
    callStrs.push(section[4].map(c => formatCall(c, '        ', used)));
  }
  for (const link of links) {
    const name = SIDE_NAMES[link[1]];
    if (name) {
      sideNames.add(name);
    }
  }

  const goal = goalOf(machine);
  let goalImport = 'GOAL_SECTION';
  let goalLiteral = `{ kind: GOAL_SECTION, section: ${goal.kind === GOAL_SECTION ? goal.section | 0 : 0} }`;
  if (goal.kind === GOAL_PINBALL) {
    goalImport = 'GOAL_PINBALL';
    goalLiteral = `{ kind: GOAL_PINBALL, balls: ${goal.balls | 0} }`;
  } else if (goal.kind === GOAL_PACHINKO) {
    goalImport = 'GOAL_PACHINKO';
    goalLiteral = `{ kind: GOAL_PACHINKO, balls: ${goal.balls | 0} }`;
  }

  const builderImports = [...used.kinds, ...used.triggers, ...used.decs, ...sideNames].sort();
  const decImports = [...used.shapes].sort();
  if (used.tex) {
    decImports.push('TEX_PALETTE');
  }
  const importBlock =
    `import type { Machine } from '../machine/MachineTypes';\n` +
    `import { ${goalImport} } from '../machine/MachineGoals';\n` +
    (builderImports.length > 0
      ? `import {\n  ${builderImports.join(',\n  ')},\n} from '../model/builders';\n`
      : '') +
    (decImports.length > 0
      ? `import {\n  ${decImports.sort().join(',\n  ')},\n} from '../model/parts/Decoration';\n`
      : '') +
    (used.icons.size > 0
      ? `import {\n  ${[...used.icons].sort().join(',\n  ')},\n} from '../model/parts/Obstacle';\n`
      : '') +
    (used.sounds.size > 0
      ? `import {\n  ${[...used.sounds].sort().join(',\n  ')},\n} from '../zzfx.js';\n`
      : '');

  const sectionLines: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const calls = callStrs[i];
    if (calls.length === 0) {
      sectionLines.push(
        `    { x: ${formatNum(s[0])}, y: ${formatNum(s[1])}, w: ${formatNum(s[2])}, h: ${formatNum(s[3])}, calls: [] },`
      );
      continue;
    }
    sectionLines.push(
      `    {
      x: ${formatNum(s[0])},
      y: ${formatNum(s[1])},
      w: ${formatNum(s[2])},
      h: ${formatNum(s[3])},
      calls: [
${calls.join(',\n')},
      ],
    },`
    );
  }

  const linkLines = links.map(l => {
    const side = SIDE_NAMES[l[1]] || String(l[1]);
    return `    { section: ${l[0]}, side: ${side}, offset: ${formatNum(l[2])}, width: ${formatNum(l[3])} },`;
  });

  const tour = machine.menuTour.map(n => String(n)).join(', ');
  const goalLines = machine.collectGoals.map(g => {
    const fields = [`group: ${g.group}`, `needed: ${g.needed}`];
    if (g.disableWall) {
      fields.push(
        `disableWall: { section: ${g.disableWall.section}, wall: ${g.disableWall.wall} }`
      );
    }
    if (g.activatePart) {
      fields.push(
        `activatePart: { section: ${g.activatePart.section}, part: ${g.activatePart.part} }`
      );
    }
    return `    { ${fields.join(', ')} },`;
  });

  return `${importBlock}
/**
 * Generated by the editor. One file per table under src/tables/.
 * The game imports src/tables/Current.ts; Vite can point that at this file or another.
 */
export const machine: Machine = {
  id: ${JSON.stringify(machine.id)},
  name: ${JSON.stringify(machine.name)},
  start: { x: ${formatNum(spawn[0])}, y: ${formatNum(spawn[1])} },
  goal: ${goalLiteral},
  menuTour: [${tour}],
  menuTourMs: ${machine.menuTourMs | 0},
  scoreKeys: {
    last: ${JSON.stringify(machine.scoreKeys.last)},
    best: ${JSON.stringify(machine.scoreKeys.best)},
  },
  theme: {
    palette: ${JSON.stringify(machine.theme.palette)},
    sectionBg: ${JSON.stringify(machine.theme.sectionBg)},
    sectionDot: ${JSON.stringify(machine.theme.sectionDot)},
    accent: ${JSON.stringify(machine.theme.accent)},
  },
  hud: { flippers: ${machine.hud.flippers}, launcher: ${machine.hud.launcher} },
  audio: { bank: ${JSON.stringify(machine.audio.bank)} },
  collectGoals: [
${goalLines.join('\n')}
  ],
  entityIdFormat: 1,
  callFormat: 2,
  sections: [
${sectionLines.join('\n')}
  ],
  links: [
${linkLines.join('\n')}
  ],
};
`;
};

export const generateLevelsTs = (
  sections: SectionData[],
  links: number[][],
  start?: number[] | { x: number; y: number } | null
): string => {
  const spawn = Array.isArray(start)
    ? { x: start[0], y: start[1] }
    : start
      ? start
      : { x: LAUNCHER_X, y: LAUNCHER_Y };
  return generateMachineTs(
    assembleMachine(PONY_MACHINE_META, sections, links, spawn)
  );
};
