import { type Circle, circleCreate } from '../sim/PhysicsFuncs';
import { playSound, SOUND_PORTAL_IN, SOUND_PORTAL_OUT } from '../audio/SoundFuncs';
import { BALL_R, PORTAL_WARP_MS } from './constants';
import { type Section, isPointInAnySection } from './SectionFuncs';

export interface Ball extends Circle {
  color: string;
  /** Remaining ms of portal travel; 0 = in play. */
  warpMs: number;
  warpX0: number;
  warpY0: number;
  warpX1: number;
  warpY1: number;
  warpVx: number;
  warpVy: number;
}

export const ballCreate = (x = 0, y = 0): Ball => {
  const b = circleCreate(x, y, BALL_R);
  return {
    ...b,
    color: 'red',
    warpMs: 0,
    warpX0: 0,
    warpY0: 0,
    warpX1: 0,
    warpY1: 0,
    warpVx: 0,
    warpVy: 0,
  };
};

export const ballIsOutOfBounds = (ball: Ball, sections: Section[]) => {
  return !isPointInAnySection(sections, ball.pos.x, ball.pos.y, 40);
};

export const ballStartWarp = (
  ball: Ball,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  ball.warpMs = PORTAL_WARP_MS;
  ball.warpX0 = x0;
  ball.warpY0 = y0;
  ball.warpX1 = x1;
  ball.warpY1 = y1;
  ball.warpVx = ball.vel.x;
  ball.warpVy = ball.vel.y;
  ball.vel.x = 0;
  ball.vel.y = 0;
  ball.pos.x = x0;
  ball.pos.y = y0;
  ball.color = '#fff';
  ball.r = BALL_R * 0.5;
  playSound(SOUND_PORTAL_IN);
};

/** Advance portal travel. Returns true while the ball is still warping. */
export const ballUpdateWarp = (ball: Ball, dt: number) => {
  if (ball.warpMs <= 0) {
    return false;
  }
  ball.warpMs -= dt;
  const u = 1 - Math.max(ball.warpMs, 0) / PORTAL_WARP_MS;
  ball.pos.x = ball.warpX0 + (ball.warpX1 - ball.warpX0) * u;
  ball.pos.y = ball.warpY0 + (ball.warpY1 - ball.warpY0) * u;
  if (ball.warpMs > 0) {
    return true;
  }
  ball.warpMs = 0;
  ball.pos.x = ball.warpX1;
  ball.pos.y = ball.warpY1;
  ball.vel.x = ball.warpVx;
  ball.vel.y = ball.warpVy;
  ball.color = 'red';
  ball.r = BALL_R;
  playSound(SOUND_PORTAL_OUT);
  return false;
};
