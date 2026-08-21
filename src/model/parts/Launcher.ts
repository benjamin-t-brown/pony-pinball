import {
  type Circle,
  Vec,
  vecCreate,
  vecMul,
  vecNorm,
} from '../../sim/physics';
import { LAUNCHER_LEN } from '../constants';
import { PART_LAUNCHER, Part } from '../Part';
import type { Section } from '../Section';

export class Launcher extends Part {
  dir: Vec;
  force = 0;
  range = 0;
  chargeMs = 500;
  len = LAUNCHER_LEN;
  charge = 0;
  pendingFire = false;

  constructor(
    x: number,
    y: number,
    control: number,
    dx: number,
    dy: number,
    force: number,
    range: number,
    chargeMs = 500,
    len = LAUNCHER_LEN
  ) {
    super(x, y, PART_LAUNCHER, control);
    this.dir = vecNorm(vecCreate(dx, dy));
    this.force = force;
    this.range = range;
    this.chargeMs = chargeMs > 0 ? chargeMs : 1;
    this.len = len > 0 ? len : LAUNCHER_LEN;
  }

  /** 0..1 fill for the charge indicator. */
  getChargeT() {
    return this.charge / this.chargeMs;
  }

  activate() {
    this.active = true;
  }

  unactivate() {
    if (this.active) {
      this.pendingFire = this.charge > 0;
    }
    this.active = false;
  }

  update(dt: number, _section: Section) {
    if (this.active) {
      this.charge += dt;
      if (this.charge > this.chargeMs) {
        this.charge = this.chargeMs;
      }
    }
  }

  affectBall(ball: Circle, ox: number, oy: number) {
    if (!this.pendingFire) {
      return;
    }
    this.pendingFire = false;
    const t = this.getChargeT();
    this.charge = 0;
    const dx = ball.pos.x - (this.x + ox);
    const dy = ball.pos.y - (this.y + oy);
    if (dx * dx + dy * dy > this.range * this.range) {
      return;
    }
    ball.vel = vecMul(this.dir, this.force * t);
  }
}
