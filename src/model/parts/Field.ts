import { type Circle, vecLen, vecMul } from '../../sim/physics';
import { PART_FIELD, Part } from '../Part';

export class Field extends Part {
  w = 0;
  h = 0;
  permanent = true;
  inside = false;
  grav = 1;
  ax = 0;
  ay = 0;
  drag = 0;
  maxSpeed = 0;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    grav = 1,
    ax = 0,
    ay = 0,
    maxSpeed = 0
  ) {
    super(x, y, PART_FIELD);
    this.active = true;
    this.w = w;
    this.h = h;
    this.grav = grav;
    this.ax = ax;
    this.ay = ay;
    this.maxSpeed = maxSpeed;
  }

  unactivate() {
    if (!this.permanent) {
      this.active = false;
    }
  }

  contains(px: number, py: number, ox: number, oy: number) {
    const x = this.x + ox;
    const y = this.y + oy;
    return px >= x && px <= x + this.w && py >= y && py <= y + this.h;
  }

  onEnter() {}

  onExit() {}

  preBall(
    ball: Circle,
    ox: number,
    oy: number,
    dtSeconds: number,
    g: number
  ) {
    const inNow =
      this.active && this.contains(ball.pos.x, ball.pos.y, ox, oy);
    if (inNow && !this.inside) {
      this.onEnter();
    } else if (!inNow && this.inside) {
      this.onExit();
    }
    this.inside = inNow;
    if (!inNow) {
      return g;
    }
    ball.vel.x += this.ax * dtSeconds;
    ball.vel.y += this.ay * dtSeconds;
    if (this.drag > 0) {
      ball.vel = vecMul(ball.vel, Math.max(0, 1 - this.drag * dtSeconds));
    }
    if (this.maxSpeed > 0) {
      const speed = vecLen(ball.vel);
      if (speed > this.maxSpeed) {
        ball.vel = vecMul(ball.vel, this.maxSpeed / speed);
      }
    }
    return g * this.grav;
  }
}
