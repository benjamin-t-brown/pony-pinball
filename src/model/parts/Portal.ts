import type { Circle } from '../../sim/PhysicsFuncs';
import { ballStartWarp, type Ball } from '../BallFuncs';
import { Part } from '../Part';
import type { Section } from '../SectionFuncs';

/** Pair of linked mouths: hit one, travel to the other, keep velocity. */
export class Portal extends Part {
  x2 = 0;
  y2 = 0;
  r = 18;
  color = 0;
  angle = 0;
  /** Until the ball leaves both mouths after a hop. */
  lock = false;

  constructor(x: number, y: number, x2: number, y2: number, r: number, color: number) {
    super(x, y);
    this.x2 = x2;
    this.y2 = y2;
    this.r = r;
    this.color = color;
    this.active = true;
  }

  update(dt: number, _section: Section) {
    this.angle += dt * 0.004;
  }

  preBall(
    ball: Circle,
    ox: number,
    oy: number,
    _dtSeconds: number,
    g: number,
    _section: Section
  ) {
    const b = ball as Ball;
    if (b.warpMs > 0) {
      return g;
    }
    const ax = this.x + ox;
    const ay = this.y + oy;
    const bx = this.x2 + ox;
    const by = this.y2 + oy;
    const hitR = this.r + ball.r;
    const hitR2 = hitR * hitR;
    const dax = ball.pos.x - ax;
    const day = ball.pos.y - ay;
    const dbx = ball.pos.x - bx;
    const dby = ball.pos.y - by;
    const inA = dax * dax + day * day <= hitR2;
    const inB = dbx * dbx + dby * dby <= hitR2;
    if (this.lock) {
      if (!inA && !inB) {
        this.lock = false;
      }
      return g;
    }
    if (inA) {
      ballStartWarp(b, ax, ay, bx, by);
      this.lock = true;
    } else if (inB) {
      ballStartWarp(b, bx, by, ax, ay);
      this.lock = true;
    }
    return g;
  }
}
