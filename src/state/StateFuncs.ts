import { Ball, ballCreate } from '../model/BallFuncs';
import { buildLevel } from '../model/builders';
import { Collectable } from '../model/parts/Collectable';
import { Section, forEachPart } from '../model/SectionFuncs';
import { resetCollectGoals, wireCollectGoals } from '../model/Trigger';
import { createPhysics, type PhysicsWorld } from '../sim/PhysicsWorld';
import { cloneCall, normalizeCall } from '../machine/MachineCalls';
import { migrateMachineEntityIds } from '../machine/EntityIdFuncs';
import {
  ballsOf,
  completeSectionOf,
  GOAL_SECTION,
  goalHigherIsBetter,
  goalOf,
  hitPoints,
} from '../machine/MachineGoals';
import { setActiveLook } from '../machine/MachineLook';
import type { Machine } from '../machine/MachineTypes';

export type State = {
  machine: Machine;
  balls: Ball[];
  physics: PhysicsWorld;
  sections: Section[];
  input: boolean[];
  startX: number;
  startY: number;
  /** Counts of collected items keyed by groupType. */
  collected: number[];
  score: number;
  ballsLeft: number;
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

const readScore = (key: string, legacy: string) => {
  return storedMs(key) || storedMs(legacy);
};

export const formatTime = (ms: number) => {
  return (ms / 1000).toFixed(1);
};

export const formatPlayValue = (value: number, machine: Machine) => {
  const goal = goalOf(machine);
  if (goal.kind === GOAL_SECTION) {
    return formatTime(value);
  }
  return String(value | 0);
};

export const playValue = (s: State) => {
  if (goalOf(s.machine).kind === GOAL_SECTION) {
    return s.playMs;
  }
  return s.score;
};

export const sectionCenter = (
  sections: Section[],
  id: number,
  fallback: { x: number; y: number }
) => {
  const room = sections[id];
  if (!room) {
    return { x: fallback.x, y: fallback.y };
  }
  return {
    x: room.x + room.w * 0.5,
    y: room.y + room.h * 0.5,
  };
};

export const idleBallPos = (s: State) => {
  return sectionCenter(
    s.sections,
    completeSectionOf(s.machine),
    { x: s.startX, y: s.startY }
  );
};

export const startPlay = () => {
  const s = getState();
  s.playing = true;
  s.complete = false;
  s.newBest = false;
  s.playMs = 0;
  s.score = 0;
  s.ballsLeft = ballsOf(goalOf(s.machine));
  s.input[0] = false;
  s.input[1] = false;
  s.input[2] = false;
  s.collected.length = 0;
  forEachPart(s.sections, part => {
    if (!(part instanceof Collectable)) {
      return;
    }
    const coin = part;
    coin.taken = false;
    coin.active = true;
  });
  resetCollectGoals(s.sections, s.machine.collectGoals);
  s.balls[0] = ballCreate(s.startX, s.startY);
  s.physics.teleportBall(0, s.balls[0]);
};

export const finishPlay = (s = getState()) => {
  if (!s || !s.playing || s.complete) {
    return;
  }
  s.playing = false;
  s.complete = true;
  const value = playValue(s);
  s.lastMs = value;
  s.prevBestMs = s.bestMs;
  s.newBest = goalHigherIsBetter(goalOf(s.machine))
    ? s.bestMs <= 0 || value > s.bestMs
    : s.bestMs <= 0 || value < s.bestMs;
  if (s.newBest) {
    s.bestMs = value;
  }
  localStorage.setItem(s.machine.scoreKeys.last, '' + s.lastMs);
  localStorage.setItem(s.machine.scoreKeys.best, '' + s.bestMs);
};

export type CreateStateOpts = {
  playing?: boolean;
};

export const createState = (
  machine: Machine,
  opts: CreateStateOpts = {}
): State => {
  const ready = migrateMachineEntityIds({
    ...machine,
    goal: goalOf(machine),
    sections: machine.sections.map(s => ({
      ...s,
      calls: s.calls.map(c => cloneCall(normalizeCall(c))),
    })),
    collectGoals: machine.collectGoals.map(g => ({
      ...g,
      disableWall: g.disableWall ? { ...g.disableWall } : undefined,
      activatePart: g.activatePart ? { ...g.activatePart } : undefined,
    })),
    links: machine.links.map(l => ({ ...l })),
  });
  setActiveLook(ready);
  const sections = buildLevel(ready.sections, ready.links);
  wireCollectGoals(sections, ready.collectGoals);
  const playing = !!opts.playing;
  const readyGoal = goalOf(ready);
  const physics = createPhysics(sections);
  const next: State = {
    machine: ready,
    balls: playing ? [ballCreate(ready.start.x, ready.start.y)] : [],
    sections,
    physics,
    input: [false, false, false],
    startX: ready.start.x,
    startY: ready.start.y,
    collected: [],
    score: 0,
    ballsLeft: ballsOf(readyGoal),
    playing,
    complete: false,
    playMs: 0,
    lastMs: readScore(ready.scoreKeys.last, 'lt'),
    bestMs: readScore(ready.scoreKeys.best, 'bt'),
    prevBestMs: 0,
    newBest: false,
  };
  physics.onHitScore = (circle, fan) => {
    if (!next.playing) {
      return;
    }
    next.score += hitPoints(goalOf(next.machine), circle, fan);
  };
  return next;
};
