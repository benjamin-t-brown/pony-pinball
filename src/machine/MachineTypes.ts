import type { MachineCall } from './MachineCalls';

export type Vec2 = {
  x: number;
  y: number;
};

export type MachineSection = {
  x: number;
  y: number;
  w: number;
  h: number;
  calls: MachineCall[];
};

export type MachineLink = {
  section: number;
  side: number;
  offset: number;
  width: number;
};

export type WallRef = {
  section: number;
  /** Stable wall id (not a walls[] index). */
  wall: number;
};

export type PartRef = {
  section: number;
  /** Stable part id (not a parts[] index). */
  part: number;
};

/** When `needed` coins of `group` are held, mutate the target wall/part. */
export type CollectGoal = {
  group: number;
  needed: number;
  disableWall?: WallRef;
  activatePart?: PartRef;
};

export type ScoreKeys = {
  last: string;
  best: string;
};

export type MachineTheme = {
  palette: string[];
  sectionBg: string;
  sectionDot: string;
  accent: string;
};

export type MachineHud = {
  flippers: boolean;
  launcher: boolean;
};

export type MachineAudio = {
  bank: 'zzfx' | 'file';
};

export type MachineMeta = {
  id: string;
  name: string;
  completeSection: number;
  menuTour: number[];
  menuTourMs: number;
  scoreKeys: ScoreKeys;
  collectGoals: CollectGoal[];
  theme: MachineTheme;
  hud: MachineHud;
  audio: MachineAudio;
};

export type Machine = MachineMeta & {
  start: Vec2;
  sections: MachineSection[];
  links: MachineLink[];
  /** 1 = wall/part trigger refs are stable ids, not build-order indices. */
  entityIdFormat?: 1;
  /** 2 = section.calls are named objects, not opcode arrays. */
  callFormat?: 2;
};

/** Editor working copy: positional section row. */
export type SectionTuple = [
  number,
  number,
  number,
  number,
  MachineCall[],
];
