import { ballCreate, ballIsOutOfBounds, type Ball } from '../model/ball';
import { MAX_BALL_SPEED } from '../model/constants';
import {
  circleIntegrate,
  resolveCircleLine,
  type Line,
  vecLen,
  vecMul,
} from './physics';
import { paddleSurfaceVel, updatePaddle } from './updatePaddle';
import type { GameState } from '../model/gameState';

export const updateBallMotion = (ball: Ball, dt: number) => {
  circleIntegrate(ball, dt);
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

export const updateSimulation = (state: GameState, dt: number) => {
  state.leftPaddle.pressed = state.input.left;
  state.rightPaddle.pressed = state.input.right;

  updatePaddle(state.leftPaddle, dt);
  updatePaddle(state.rightPaddle, dt);

  updateBallMotion(state.ball, dt);
  resolveBallWalls(state.ball, state.walls);

  resolveCircleLine(
    state.ball,
    state.leftPaddle.line,
    0.55,
    paddleSurfaceVel(state.leftPaddle, dt)
  );
  resolveCircleLine(
    state.ball,
    state.rightPaddle.line,
    0.55,
    paddleSurfaceVel(state.rightPaddle, dt)
  );

  clampBallSpeed(state.ball);

  if (ballIsOutOfBounds(state.ball, state.width, state.height)) {
    state.ball = ballCreate();
  }
};
