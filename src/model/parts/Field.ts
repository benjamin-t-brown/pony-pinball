import { type Circle, vecLen, vecMul } from '../../sim/physics';
import type { Ball } from '../Ball';
import { PART_FIELD, Part } from '../Part';
import type { Section } from '../Section';
import type { Trigger } from '../Trigger';
import { playSound, SOUND_BALL_TRAVELING } from '../../zzfx.js';

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
  trigger: Trigger | null = null;

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

  onEnter() {
    if (!this.trigger && this.grav === 0 && (this.ax || this.ay)) {
      playSound(SOUND_BALL_TRAVELING);
    }
  }

  onExit() {}

  preBall(
    ball: Circle,
    ox: number,
    oy: number,
    dtSeconds: number,
    g: number,
    section: Section,
    _state?: { collected: number[]; sections: Section[] }
  ) {
    const inNow =
      this.active && this.contains(ball.pos.x, ball.pos.y, ox, oy);
    if (inNow && !this.inside) {
      this.onEnter();
      if (this.trigger) {
        this.trigger.onActivated(section, ball as Ball);
      }
    } else if (!inNow && this.inside) {
      this.onExit();
      if (this.trigger) {
        this.trigger.onDeactivated(section);
      }
    }
    this.inside = inNow;
    if (this.trigger) {
      this.trigger.onUpdate(dtSeconds * 1000, section);
    }
    if (!inNow) {
      return g;
    }
    if (this.trigger) {
      return g;
    }

    // Conveyer / beam: zero gravity, accelerate along a direction, damp sideways
    // motion so the ball settles into the stream instead of skating across it.
    const forceLen = Math.hypot(this.ax, this.ay);
    if (this.grav === 0 && forceLen > 0) {
      const nx = this.ax / forceLen;
      const ny = this.ay / forceLen;
      const along = ball.vel.x * nx + ball.vel.y * ny;
      const catchRate = this.drag > 0 ? this.drag : 4;
      const damp = Math.max(0, 1 - catchRate * dtSeconds);
      let newAlong = along + forceLen * dtSeconds;
      if (this.maxSpeed > 0) {
        if (newAlong > this.maxSpeed) {
          newAlong = this.maxSpeed;
        } else if (newAlong < -this.maxSpeed) {
          newAlong = -this.maxSpeed;
        }
      }
      ball.vel.x = nx * newAlong + (ball.vel.x - nx * along) * damp;
      ball.vel.y = ny * newAlong + (ball.vel.y - ny * along) * damp;
      return 0;
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
