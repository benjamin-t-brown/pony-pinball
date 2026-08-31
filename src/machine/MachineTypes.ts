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

/** Race: reach a room. Lower time wins. */
export const GOAL_SECTION = 0;
/** Pinball: N balls, high score. */
export const GOAL_PINBALL = 1;
/** Pachinko: N balls, most tickets. */
export const GOAL_PACHINKO = 2;

export type GoalSection = {
  kind: typeof GOAL_SECTION;
  section: number;
};

export type GoalPinball = {
  kind: typeof GOAL_PINBALL;
  balls: number;
};

export type GoalPachinko = {
  kind: typeof GOAL_PACHINKO;
  balls: number;
};

export type MachineGoal = GoalSection | GoalPinball | GoalPachinko;

export type MachineMeta = {
  id: string;
  name: string;
  goal: MachineGoal;
  /** @deprecated Use `goal`. Kept so old table files still load. */
  completeSection?: number;
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
