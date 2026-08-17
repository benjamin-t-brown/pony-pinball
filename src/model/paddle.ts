import {
  type Line,
  type Vec,
  lineCreate,
  lineSet,
  vecCreate,
} from '../sim/physics';
import { PADDLE_LEN } from './constants';

export type Paddle = {
  pivot: Vec;
  angle: number;
  rest: number;
  up: number;
  pressed: boolean;
  line: Line;
  tipPrev: Vec;
  length: number;
};

export const paddleTipAt = (pivot: Vec, angle: number, length: number): Vec =>
  vecCreate(
    pivot.x + Math.cos(angle) * length,
    pivot.y + Math.sin(angle) * length
  );

export const paddleCreate = (
  pivot: Vec,
  rest: number,
  up: number,
  length = PADDLE_LEN
): Paddle => {
  const tip = paddleTipAt(pivot, rest, length);
  return {
    pivot,
    angle: rest,
    rest,
    up,
    pressed: false,
    line: lineCreate(pivot.x, pivot.y, tip.x, tip.y),
    tipPrev: tip,
    length,
  };
};

export const paddleSyncLine = (paddle: Paddle) => {
  const tip = paddleTipAt(paddle.pivot, paddle.angle, paddle.length);
  lineSet(paddle.line, paddle.pivot.x, paddle.pivot.y, tip.x, tip.y);
  return tip;
};
