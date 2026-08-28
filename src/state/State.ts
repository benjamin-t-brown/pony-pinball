import { Ball, ballCreate } from '../model/Ball';
import { buildLevel } from '../model/builders';
import { COMPLETE_SECTION } from '../model/constants';
import { PART_COLLECTABLE } from '../model/Part';
import type { Collectable } from '../model/parts/Collectable';
import { Section, flattenSectionWalls, forEachPart } from '../model/Section';
import { resetGateSection4 } from '../model/Trigger';
import { Line } from '../sim/physics';
import { LINKS, SECTIONS, START } from '../levels';

export type State = {
  balls: Ball[];
  walls: Line[];
  sections: Section[];
  input: boolean[];
  startX: number;
  startY: number;
  /** Counts of collected items keyed by groupType. */
  collected: number[];
  playing: boolean;
  complete: boolean;
  playMs: number;
  lastMs: number;
  bestMs: number;
  prevBestMs: number;
  newBest: boolean;
};

export let state: State;

export const getState = () => {
  return state;
};

export const setState = (s: State) => {
  state = s;
};

const storedMs = (k: string) => {
  return Number(localStorage.getItem(k)) || 0;
};

export const formatTime = (ms: number) => {
  return (ms / 1000).toFixed(1);
};

export const sectionCenter = (sections: Section[], id: number) => {
  const room = sections[id];
  if (!room) {
    return { x: START[0], y: START[1] };
  }
  return {
    x: room.x + room.w * 0.5,
    y: room.y + room.h * 0.5,
  };
};

export const idleBallPos = (sections: Section[]) => {
  return sectionCenter(sections, COMPLETE_SECTION);
};

export const startPlay = () => {
  const s = getState();
  s.playing = true;
  s.complete = false;
  s.newBest = false;
  s.playMs = 0;
  s.input[0] = false;
  s.input[1] = false;
  s.input[2] = false;
  s.collected.length = 0;
  forEachPart(s.sections, part => {
    if (part.type !== PART_COLLECTABLE) {
      return;
    }
    const coin = part as Collectable;
    coin.taken = false;
    coin.active = true;
  });
  resetGateSection4(s.sections);
  s.balls[0] = ballCreate(s.startX, s.startY);
};

export const finishPlay = () => {
  const s = getState();
  if (!s.playing || s.complete) {
    return;
  }
  s.playing = false;
  s.complete = true;
  s.lastMs = s.playMs;
  s.prevBestMs = s.bestMs;
  s.newBest = s.bestMs <= 0 || s.playMs < s.bestMs;
  if (s.newBest) {
    s.bestMs = s.playMs;
  }
  localStorage.setItem('lt', '' + s.lastMs);
  localStorage.setItem('bt', '' + s.bestMs);
};

export const createState = (): State => {
  const sections = buildLevel(SECTIONS, LINKS);
  return {
    balls: [],
    sections,
    walls: flattenSectionWalls(sections),
    input: [false, false, false],
    startX: START[0],
    startY: START[1],
    collected: [],
    playing: false,
    complete: false,
    playMs: 0,
    lastMs: storedMs('lt'),
    bestMs: storedMs('bt'),
    prevBestMs: 0,
    newBest: false,
  };
};
