import { ballCreate, ballIsOutOfBounds, type Ball } from '../model/Ball';
import { MAX_BALL_SPEED } from '../model/constants';
import {
  flattenSectionWalls,
  forEachPart,
  sectionContains,
} from '../model/Section';
import {
  GRAVITY,
  circleIntegrate,
  resolveCircleLine,
  type Circle,
  type Line,
  type Vec,
  vecLen,
  vecMul,
} from './physics';
import type { State } from '../state/State';

export const updateBallMotion = (
  ball: Ball,
  dtSeconds: number,
  gravity = GRAVITY
) => {
  circleIntegrate(ball, dtSeconds, gravity);
};

export const clampBallSpeed = (ball: Ball, maxSpeed = MAX_BALL_SPEED) => {
  const speed = vecLen(ball.vel);
  if (speed > maxSpeed) {
    ball.vel = vecMul(ball.vel, maxSpeed / speed);
  }
};

export const resolveBallWalls = (
  ball: Circle,
  walls: Line[],
  surfaceVel: Vec | null = null
) => {
  let hit = false;
  for (let i = 0; i < walls.length; i++) {
    if (resolveCircleLine(ball, walls[i], 0, surfaceVel)) {
      hit = true;
    }
  }
  return hit;
};

export const updateParts = (state: State, dt: number) => {
  forEachPart(state.sections, (part, section) => {
    // Only player-driven parts follow the input; everything else owns its own
    // active flag (bumper flash timers, permanent fields).
    if (part.control >= 0) {
      let inSection = false;
      for (let i = 0; i < state.balls.length; i++) {
        const p = state.balls[i].pos;
        if (sectionContains(section, p.x, p.y)) {
          inSection = true;
          break;
        }
      }
      if (state.input[part.control] && inSection) {
        part.activate();
      } else {
        part.unactivate();
      }
    }
    part.update(dt, section);
  });
};

/** Applies pre-integration forces and returns the gravity to integrate with. */
export const preBallParts = (ball: Ball, state: State, dtSeconds: number) => {
  let g = GRAVITY;
  forEachPart(state.sections, (part, section) => {
    g = part.preBall(ball, section.x, section.y, dtSeconds, g, section);
  });
  return g;
};

export const resolveBallParts = (ball: Ball, state: State) => {
  forEachPart(state.sections, (part, section) => {
    part.affectBall(ball, section.x, section.y);
  });
};

export const updateSimulation = (state: State, dt: number) => {
  const dtSeconds = dt / 1000;
  updateParts(state, dt);
  for (let i = 0; i < state.balls.length; i++) {
    const ball = state.balls[i];
    updateBallMotion(ball, dtSeconds, preBallParts(ball, state, dtSeconds));
    flattenSectionWalls(state.sections, state.walls);
    resolveBallWalls(ball, state.walls);
    resolveBallParts(ball, state);
    // A paddle sweeping into a ball can push it through a wall, so give the
    // walls the last word on position.
    resolveBallWalls(ball, state.walls);
    clampBallSpeed(ball);

    if (ballIsOutOfBounds(ball, state.sections)) {
      state.balls[i] = ballCreate(state.startX, state.startY);
    }
  }
};
