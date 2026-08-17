import { type Circle, circleCreate } from '../sim/physics';
import { BALL_R } from './constants';
import { type Section, isPointInAnySection } from './Section';

export interface Ball extends Circle {
  color: string;
}

export const ballCreate = (x = 0, y = 0): Ball => {
  const b = circleCreate(x, y, BALL_R, 1);
  return { ...b, color: 'red' };
};

export const ballIsOutOfBounds = (ball: Ball, sections: Section[]) => {
  return !isPointInAnySection(sections, ball.pos.x, ball.pos.y, 40);
};
