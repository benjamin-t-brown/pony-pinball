import { type Circle, circleCreate } from '../sim/physics';
import { BALL_R } from './constants';

export interface Ball extends Circle {
  color: string;
}

export const ballCreate = (x = 0, y = 0): Ball => {
  const b = circleCreate(x, y, BALL_R, 1);
  return { ...b, color: 'red' };
};

export const ballIsOutOfBounds = (ball: Ball, w: number, h: number) => {
  return ball.pos.y > h + 40 || ball.pos.x < -40 || ball.pos.x > w + 40;
};
