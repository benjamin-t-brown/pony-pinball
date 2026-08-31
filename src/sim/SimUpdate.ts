import {
  ballCreate,
  ballIsOutOfBounds,
  ballUpdateWarp,
  type Ball,
} from '../model/BallFuncs';
import { MAX_BALL_SPEED } from '../model/constants';
import { forEachPart, sectionContains } from '../model/SectionFuncs';
import { GRAVITY, vecLen, vecMul } from './PhysicsFuncs';
import { idleBallPos, type State, finishPlay } from '../state/StateFuncs';
import { clearSoundsPlayedThisTick } from '../audio/SoundFuncs';
import { goalUsesBalls, goalOf } from '../machine/MachineGoals';

export const clampBallSpeed = (ball: Ball, maxSpeed = MAX_BALL_SPEED) => {
  const speed = vecLen(ball.vel);
  if (speed > maxSpeed) {
    ball.vel = vecMul(ball.vel, maxSpeed / speed);
  }
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
        if (!part.active) {
          part.onControlOn();
        }
        part.activate();
      } else {
        if (part.active) {
          part.onControlOff();
        }
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
    g = part.preBall(ball, section.x, section.y, dtSeconds, g, section, state);
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
  const gravity: number[] = [];
  for (let i = 0; i < state.balls.length; i++) {
    const ball = state.balls[i];
    if (ball.warpMs > 0) {
      ballUpdateWarp(ball, dt);
      gravity[i] = 0;
      continue;
    }
    gravity[i] = preBallParts(ball, state, dtSeconds);
  }

  const physics = state.physics;
  physics.syncWalls();
  physics.syncKinematics();
  physics.syncBalls(state.balls, gravity);
  physics.step(dtSeconds);
  physics.writeBalls(state.balls);
  physics.snapKinematics();

  for (let i = 0; i < state.balls.length; i++) {
    const ball = state.balls[i];
    if (ball.warpMs > 0) {
      continue;
    }
    resolveBallParts(ball, state);
    clampBallSpeed(ball);
    physics.applyBallVel(i, ball);

    if (ballIsOutOfBounds(ball, state.sections)) {
      if (state.playing && goalUsesBalls(goalOf(state.machine))) {
        state.ballsLeft -= 1;
        if (state.ballsLeft <= 0) {
          finishPlay(state);
          const spawn = idleBallPos(state);
          state.balls[i] = ballCreate(spawn.x, spawn.y);
          physics.teleportBall(i, state.balls[i]);
          continue;
        }
      }
      if (state.playing) {
        state.balls[i] = ballCreate(state.startX, state.startY);
      } else {
        const spawn = idleBallPos(state);
        state.balls[i] = ballCreate(spawn.x, spawn.y);
      }
      physics.teleportBall(i, state.balls[i]);
    }
  }
  clearSoundsPlayedThisTick();
};
