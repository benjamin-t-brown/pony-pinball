import { ballCreate, type Ball } from '@game/model/BallFuncs';
import { assembleMachine } from '@game/machine/MachineFormats';
import type { MachineMeta } from '@game/machine/MachineTypes';
import { createState, type State } from '@game/state/StateFuncs';
import type { SectionData } from './types';

export const createPlayState = (
  sections: SectionData[],
  links: number[][],
  spawn: { x: number; y: number } | null,
  meta: MachineMeta
): State => {
  const start = spawn || { x: 0, y: 0 };
  return createState(assembleMachine(meta, sections, links, start), {
    playing: true,
  });
};

export const dropBall = (state: State, x: number, y: number) => {
  state.startX = x;
  state.startY = y;
  if (state.balls[0]) {
    state.balls[0].pos.x = x;
    state.balls[0].pos.y = y;
    state.balls[0].vel.x = 0;
    state.balls[0].vel.y = 0;
    state.physics.teleportBall(0, state.balls[0]);
    return;
  }
  state.balls.push(ballCreate(x, y));
  state.physics.teleportBall(0, state.balls[0]);
};

export type { Ball };
