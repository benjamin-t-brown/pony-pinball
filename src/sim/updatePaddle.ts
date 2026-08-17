import { PADDLE_RETURN, PADDLE_SPEED } from '../model/constants';
import { paddleSyncLine, type Paddle } from '../model/paddle';
import { type Vec, vecCreate, vecMul, vecSub } from './physics';

export const updatePaddle = (paddle: Paddle, dt: number) => {
  paddle.tipPrev = vecCreate(paddle.line.b.x, paddle.line.b.y);
  const target = paddle.pressed ? paddle.up : paddle.rest;
  const speed = paddle.pressed ? PADDLE_SPEED : PADDLE_RETURN;
  const delta = target - paddle.angle;
  const step = Math.sign(delta) * Math.min(Math.abs(delta), speed * dt);
  paddle.angle += step;
  paddleSyncLine(paddle);
};

export const paddleSurfaceVel = (paddle: Paddle, dt: number): Vec => {
  const tipVel = vecMul(
    vecSub(paddle.line.b, paddle.tipPrev),
    1 / Math.max(dt, 1e-4)
  );
  return vecMul(tipVel, 0.7);
};
