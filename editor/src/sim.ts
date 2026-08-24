import { ballCreate, type Ball } from '@game/model/Ball';
import { LAUNCHER_X, LAUNCHER_Y } from '@game/model/constants';
import { buildLevel } from '@game/model/builders';
import { flattenSectionWalls } from '@game/model/Section';
import type { State } from '@game/state/State';
import type { SectionData } from './types';

export const createPlayState = (
  sections: SectionData[],
  links: number[][],
  spawn: { x: number; y: number } | null
): State => {
  const built = buildLevel(sections, links);
  const start = built[0];
  const x = spawn ? spawn.x : start ? start.x + LAUNCHER_X : 0;
  const y = spawn ? spawn.y : start ? start.y + LAUNCHER_Y : 0;
  return {
    balls: [ballCreate(x, y)],
    sections: built,
    walls: flattenSectionWalls(built),
    input: [false, false, false],
    startX: x,
    startY: y,
    collected: [],
    playing: true,
    playMs: 0,
    lastMs: 0,
    bestMs: 0,
    prevBestMs: 0,
    complete: false,
    newBest: false,
  };
};

export const dropBall = (state: State, x: number, y: number) => {
  state.startX = x;
  state.startY = y;
  if (state.balls[0]) {
    state.balls[0].pos.x = x;
    state.balls[0].pos.y = y;
    state.balls[0].vel.x = 0;
    state.balls[0].vel.y = 0;
    return;
  }
  state.balls.push(ballCreate(x, y));
};

export type { Ball };
