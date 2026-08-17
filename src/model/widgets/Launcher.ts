import {
  type Circle,
  Vec,
  vecCreate,
  vecMul,
  vecNorm,
} from '../../sim/physics';
import { WIDGET_LAUNCHER, Widget } from './Widget';

export class Launcher extends Widget {
  dir: Vec;
  force = 0;
  range = 0;
  fired = false;

  constructor(
    x: number,
    y: number,
    control: number,
    dx: number,
    dy: number,
    force: number,
    range: number
  ) {
    super(x, y, WIDGET_LAUNCHER, control);
    this.dir = vecNorm(vecCreate(dx, dy));
    this.force = force;
    this.range = range;
  }

  unactivate() {
    this.active = false;
    this.fired = false;
  }

  affectBall(ball: Circle, ox: number, oy: number) {
    if (!this.active || this.fired) {
      return;
    }
    const dx = ball.pos.x - (this.x + ox);
    const dy = ball.pos.y - (this.y + oy);
    if (dx * dx + dy * dy > this.range * this.range) {
      return;
    }
    ball.vel = vecMul(this.dir, this.force);
    this.fired = true;
  }
}
