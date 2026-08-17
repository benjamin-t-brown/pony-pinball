import { type Circle, circleCreate, vecCreate } from '../sim/physics';
import { BALL_R, W } from './constants';

export type Ball = Circle;

export const ballCreate = (
  x = W * 0.5 + (Math.random() - 0.5) * 40,
  y = 50
): Ball => {
  const b = circleCreate(x, y, BALL_R, 1);
  b.vel = vecCreate((Math.random() - 0.5) * 40, 20);
  return b;
};

export const ballIsOutOfBounds = (ball: Ball, w: number, h: number) =>
  ball.pos.y > h + 40 || ball.pos.x < -40 || ball.pos.x > w + 40;
