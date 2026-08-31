import { cloneCall, normalizeCall } from './MachineCalls';
import { migrateMachineEntityIds } from './EntityIdFuncs';
import {
  audioOf,
  DEFAULT_AUDIO,
  DEFAULT_HUD,
  DEFAULT_THEME,
  hudOf,
  themeOf,
} from './MachineLook';
import type {
  Machine,
  MachineLink,
  MachineMeta,
  MachineSection,
  SectionTuple,
} from './MachineTypes';

export const DEFAULT_MENU_TOUR_MS = 20000;

/** Filenames that are not tables. */
export const RESERVED_MACHINE_IDS = new Set(['current']);

export const sanitizeMachineId = (id: string) => {
  const next = id.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  return next.replace(/^-+|-+$/g, '') || 'untitled';
};

/** `pony` → `Pony`, `my-table` → `MyTable`. Filename stem under src/tables/. */
export const machineFileStem = (id: string) => {
  return sanitizeMachineId(id)
    .split(/[-_]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

export const defaultMachineMeta = (): MachineMeta => ({
  id: 'untitled',
  name: 'Untitled',
  completeSection: 0,
  menuTour: [],
  menuTourMs: DEFAULT_MENU_TOUR_MS,
  scoreKeys: { last: 'untitled:lt', best: 'untitled:bt' },
  collectGoals: [],
  theme: themeOf({ theme: DEFAULT_THEME }),
  hud: { ...DEFAULT_HUD },
  audio: { ...DEFAULT_AUDIO },
});

export const blankMachine = (id: string, name?: string): Machine => {
  const safe = sanitizeMachineId(id);
  return {
    ...defaultMachineMeta(),
    id: safe,
    name: (name && name.trim()) || 'Untitled',
    scoreKeys: { last: `${safe}:lt`, best: `${safe}:bt` },
    start: { x: 200, y: 350 },
    sections: [{ x: 0, y: 0, w: 400, h: 400, calls: [] }],
    links: [],
    entityIdFormat: 1,
    callFormat: 2,
  };
};

export const defaultMachine = (): Machine => ({
  ...defaultMachineMeta(),
  start: { x: 0, y: 0 },
  sections: [],
  links: [],
});

/** Current table: identity that used to live in engine constants. */
export const PONY_MACHINE_META: MachineMeta = {
  id: 'pony',
  name: 'Pony Pinball',
  completeSection: 15,
  menuTour: [2, 12, 8],
  menuTourMs: DEFAULT_MENU_TOUR_MS,
  scoreKeys: { last: 'pony:lt', best: 'pony:bt' },
  collectGoals: [
    {
      group: 0,
      needed: 6,
      disableWall: { section: 4, wall: 715 },
      activatePart: { section: 4, part: 731 },
    },
  ],
  theme: themeOf({ theme: DEFAULT_THEME }),
  hud: { ...DEFAULT_HUD },
  audio: { ...DEFAULT_AUDIO },
};

export const machineMetaOf = (machine: Machine): MachineMeta => ({
  id: machine.id,
  name: machine.name,
  completeSection: machine.completeSection,
  menuTour: machine.menuTour.slice(),
  menuTourMs: machine.menuTourMs,
  scoreKeys: { ...machine.scoreKeys },
  collectGoals: machine.collectGoals.map(g => ({
    group: g.group,
    needed: g.needed,
    disableWall: g.disableWall ? { ...g.disableWall } : undefined,
    activatePart: g.activatePart ? { ...g.activatePart } : undefined,
  })),
  theme: themeOf(machine),
  hud: hudOf(machine),
  audio: audioOf(machine),
});

export const withMachineDefaults = (partial: Partial<Machine>): Machine => {
  const base = defaultMachine();
  const next: Machine = {
    ...base,
    ...partial,
    start: partial.start ? { ...partial.start } : base.start,
    scoreKeys: { ...base.scoreKeys, ...partial.scoreKeys },
    collectGoals: partial.collectGoals
      ? partial.collectGoals.map(g => ({
          ...g,
          disableWall: g.disableWall ? { ...g.disableWall } : undefined,
          activatePart: g.activatePart ? { ...g.activatePart } : undefined,
        }))
      : base.collectGoals,
    menuTour: partial.menuTour ? partial.menuTour.slice() : base.menuTour,
    theme: themeOf(partial),
    hud: hudOf(partial),
    audio: audioOf(partial),
    sections: (partial.sections || base.sections).map(s => ({
      ...s,
      calls: s.calls.map(c => cloneCall(normalizeCall(c))),
    })),
    links: (partial.links || base.links).map(l => ({ ...l })),
  };
  return migrateMachineEntityIds(next);
};

export const tuplesToSections = (rows: SectionTuple[]): MachineSection[] => {
  return rows.map(([x, y, w, h, calls]) => ({ x, y, w, h, calls }));
};

export const sectionsToTuples = (sections: MachineSection[]): SectionTuple[] => {
  return sections.map(s => [s.x, s.y, s.w, s.h, s.calls]);
};

export const tuplesToLinks = (rows: number[][]): MachineLink[] => {
  return rows.map(([section, side, offset, width]) => ({
    section,
    side,
    offset,
    width,
  }));
};

export const linksToTuples = (links: MachineLink[]): number[][] => {
  return links.map(l => [l.section, l.side, l.offset, l.width]);
};

export const assembleMachine = (
  meta: MachineMeta,
  sections: SectionTuple[],
  links: number[][],
  start: { x: number; y: number }
): Machine => ({
  id: meta.id,
  name: meta.name,
  completeSection: meta.completeSection,
  menuTour: meta.menuTour.slice(),
  menuTourMs: meta.menuTourMs,
  scoreKeys: { ...meta.scoreKeys },
  collectGoals: meta.collectGoals.map(g => ({
    group: g.group,
    needed: g.needed,
    disableWall: g.disableWall ? { ...g.disableWall } : undefined,
    activatePart: g.activatePart ? { ...g.activatePart } : undefined,
  })),
  theme: themeOf(meta),
  hud: hudOf(meta),
  audio: audioOf(meta),
  start: { x: start.x, y: start.y },
  sections: tuplesToSections(sections),
  links: tuplesToLinks(links),
});

export const remapMachineMetaAfterDelete = (
  meta: MachineMeta,
  deleted: number
): MachineMeta => {
  const shift = (i: number) => {
    if (i === deleted) {
      return -1;
    }
    return i > deleted ? i - 1 : i;
  };
  let completeSection = meta.completeSection;
  if (completeSection === deleted) {
    completeSection = 0;
  } else if (completeSection > deleted) {
    completeSection -= 1;
  }
  return {
    ...meta,
    completeSection,
    menuTour: meta.menuTour
      .filter(i => i !== deleted)
      .map(i => (i > deleted ? i - 1 : i)),
    collectGoals: meta.collectGoals.map(g => {
      const wallSi = g.disableWall ? shift(g.disableWall.section) : -1;
      const partSi = g.activatePart ? shift(g.activatePart.section) : -1;
      return {
        ...g,
        disableWall:
          g.disableWall && wallSi >= 0
            ? { section: wallSi, wall: g.disableWall.wall }
            : undefined,
        activatePart:
          g.activatePart && partSi >= 0
            ? { section: partSi, part: g.activatePart.part }
            : undefined,
      };
    }),
  };
};

export const machineFromModule = (mod: {
  machine?: Machine;
  SECTIONS?: SectionTuple[];
  LINKS?: number[][];
  START?: number[];
}): Machine => {
  if (mod.machine) {
    return withMachineDefaults(mod.machine);
  }
  return assembleMachine(
    PONY_MACHINE_META,
    mod.SECTIONS || [],
    mod.LINKS || [],
    { x: mod.START?.[0] || 0, y: mod.START?.[1] || 0 }
  );
};

