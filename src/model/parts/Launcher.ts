import {
  type Circle,
  Vec,
  vecCreate,
  vecMul,
  vecNorm,
} from '../../sim/PhysicsFuncs';
import { LAUNCHER_CHARGE_MS, LAUNCHER_FORCE, LAUNCHER_LEN, LAUNCHER_RANGE } from '../Constants';
import { Part } from '../Part';
import type { Section } from '../SectionFuncs';
import {
  playSound,
  SOUND_LAUNCH,
  SOUND_LAUNCH_PULL_BACK,
} from '../../audio/SoundFuncs';

export class Launcher extends Part {
  dir: Vec;
  force = 0;
  range = LAUNCHER_RANGE;
  chargeMs = LAUNCHER_CHARGE_MS;
  len = LAUNCHER_LEN;
  charge = 0;
  pendingFire = false;

  constructor(
    x: number,
    y: number,
    control: number,
    dx = 0,
    dy = -1,
    force = LAUNCHER_FORCE,
    range = LAUNCHER_RANGE,
    chargeMs = LAUNCHER_CHARGE_MS,
    len = LAUNCHER_LEN
  ) {
    super(x, y, control);
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
    if (!this.active) {
      playSound(SOUND_LAUNCH_PULL_BACK);
    }
    this.active = true;
  }

  unactivate() {
    if (this.active) {
      this.pendingFire = this.charge > 0;
      if (this.pendingFire) {
        playSound(SOUND_LAUNCH);
      }
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
