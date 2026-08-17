import { ballCreate, ballIsOutOfBounds, type Ball } from '../model/Ball';
import {
  LAUNCHER_X,
  LAUNCHER_Y,
  MAX_BALL_SPEED,
} from '../model/constants';
import { forEachWidget, getSection, sectionContains } from '../model/Section';
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
    resolveCircleLine(ball, wall);
  }
};

export const updateWidgets = (state: State, dt: number) => {
  forEachWidget(state.sections, (widget, section) => {
    let inSection = false;
    for (let i = 0; i < state.balls.length; i++) {
      const p = state.balls[i].pos;
      if (sectionContains(section, p.x, p.y)) {
        inSection = true;
        break;
      }
    }
    if (state.input[widget.control] && inSection) {
      widget.activate();
    } else {
      widget.unactivate();
    }
    widget.update(dt);
  });
};

export const resolveBallWidgets = (ball: Ball, state: State) => {
  forEachWidget(state.sections, (widget, section) => {
    widget.affectBall(ball, section.x, section.y);
  });
};

export const updateSimulation = (state: State, dt: number) => {
  const dtSeconds = dt / 1000;
  updateWidgets(state, dt);
  for (let i = 0; i < state.balls.length; i++) {
    const ball = state.balls[i];
    updateBallMotion(ball, dtSeconds);
    resolveBallWalls(ball, state.walls);
    resolveBallWidgets(ball, state);
    clampBallSpeed(ball);

    if (ballIsOutOfBounds(ball, state.sections)) {
      const start = getSection(state.sections, 'start');
      state.balls[i] = ballCreate(
        start.x + LAUNCHER_X,
        start.y + LAUNCHER_Y
      );
    }
  }
};
