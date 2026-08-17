import type { Circle, Line } from '../../sim/physics';
import {
  lineClosestPoint,
  lineCreate,
  lineSet,
  resolveCircleLine,
  vecCreate,
} from '../../sim/physics';
import type { Section } from '../Section';

export class Obstacle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  angle = 0;
  omega = 0;
  walls: Line[] = [];
  worldWalls: Line[] = [];
  active = false;
  alwaysSolid = true;
  touching = false;

  constructor(
    x: number,
    y: number,
    walls: Line[],
    vx = 0,
    vy = 0,
    omega = 0
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.omega = omega;
    this.walls = walls;
    for (let i = 0; i < walls.length; i++) {
      this.worldWalls.push(lineCreate(0, 0, 0, 0, walls[i].rest));
    }
  }

  activate() {
    this.active = true;
  }

  unactivate() {
    this.active = false;
  }

  onHit() {
    this.activate();
  }

  update(dt: number, section: Section) {
    const dtSeconds = dt / 1000;
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;
    this.angle += this.omega * dtSeconds;

    if (this.x < 0) {
      this.x = 0;
      if (this.vx < 0) {
        this.vx = -this.vx;
      }
    } else if (this.x > section.w) {
      this.x = section.w;
      if (this.vx > 0) {
        this.vx = -this.vx;
      }
    }
    if (this.y < 0) {
      this.y = 0;
      if (this.vy < 0) {
        this.vy = -this.vy;
      }
    } else if (this.y > section.h) {
      this.y = section.h;
      if (this.vy > 0) {
        this.vy = -this.vy;
      }
    }
  }

  affectBall(ball: Circle, ox: number, oy: number) {
    if (!this.active && !this.alwaysSolid) {
      this.touching = false;
      return;
    }
    const wx = this.x + ox;
    const wy = this.y + oy;
    const ca = Math.cos(this.angle);
    const sa = Math.sin(this.angle);
    let hit = false;
    for (let i = 0; i < this.walls.length; i++) {
      const w = this.walls[i];
      const ax = w.a.x * ca - w.a.y * sa;
      const ay = w.a.x * sa + w.a.y * ca;
      const bx = w.b.x * ca - w.b.y * sa;
      const by = w.b.x * sa + w.b.y * ca;
      const ww = this.worldWalls[i];
      lineSet(ww, ax + wx, ay + wy, bx + wx, by + wy);
      const cp = lineClosestPoint(ww, ball.pos);
      if (
        resolveCircleLine(
          ball,
          ww,
          0,
          vecCreate(
            this.vx - this.omega * (cp.y - wy),
            this.vy + this.omega * (cp.x - wx)
          )
        )
      ) {
        hit = true;
      }
    }
    if (hit && !this.touching) {
      this.onHit();
    }
    this.touching = hit;
  }
}
