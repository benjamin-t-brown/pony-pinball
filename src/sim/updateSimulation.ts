import { ballCreate, ballIsOutOfBounds, type Ball } from '../model/ball';
import { MAX_BALL_SPEED } from '../model/constants';
import {
  circleIntegrate,
  resolveCircleLine,
  type Line,
  vecLen,
  vecMul,
} from './physics';
import type { State } from '../state/State';

export const updateBallMotion = (ball: Ball, dtSeconds: number) => {
  circleIntegrate(ball, dtSeconds);
};

export const clampBallSpeed = (ball: Ball, maxSpeed = MAX_BALL_SPEED) => {
  const speed = vecLen(ball.vel);
  if (speed > maxSpeed) {
    ball.vel = vecMul(ball.vel, maxSpeed / speed);
  }
};

export const resolveBallWalls = (ball: Ball, walls: Line[]) => {
  for (const wall of walls) {
    resolveCircleLine(ball, wall, 0.7);
  }
};

export const updateSimulation = (state: State, dt: number) => {
  const dtSeconds = dt / 1000;
  for (let i = 0; i < state.balls.length; i++) {
    const ball = state.balls[i];
    updateBallMotion(ball, dtSeconds);
    resolveBallWalls(ball, state.walls);
    clampBallSpeed(ball);

    if (ballIsOutOfBounds(ball, state.width, state.height)) {
      state.balls[i] = ballCreate(230, 100);
    }
  }
};
