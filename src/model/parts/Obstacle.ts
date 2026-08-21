import type { Circle, Line } from '../../sim/physics';
import { lineCreate, lineSet, vecCreate } from '../../sim/physics';
import { resolveBallWalls } from '../../sim/updateSimulation';
import type { Section } from '../Section';
import { PART_OBSTACLE, Part } from '../Part';

const FLASH_MS = 120;

export class Obstacle extends Part {
  vx = 0;
  vy = 0;
  angle = 0;
  omega = 0;
  r = 0;
  walls: Line[] = [];
  worldWalls: Line[] = [];
  alwaysSolid = true;
  touching = false;
  flash = 0;

  constructor(
    x: number,
    y: number,
    type: number,
    walls: Line[],
    vx = 0,
    vy = 0,
    omega = 0
  ) {
    super(x, y, type);
    this.vx = vx;
    this.vy = vy;
    this.omega = omega;
    this.walls = walls;
    for (let i = 0; i < walls.length; i++) {
      this.worldWalls.push(lineCreate(0, 0, 0, 0, walls[i].rest));
    }
  }

  onHit() {
    this.activate();
    this.flash = FLASH_MS;
  }

  update(dt: number, section: Section) {
    const dtSeconds = dt / 1000;
    if (this.flash > 0) {
      this.flash -= dt;
      if (this.flash <= 0) {
        this.unactivate();
      }
    }
    this.x += this.vx * dtSeconds;
    this.y += this.vy * dtSeconds;
    this.angle += this.omega * dtSeconds;

    const r = this.r;
    if (this.x < r) {
      this.x = r;
      if (this.vx < 0) {
        this.vx = -this.vx;
      }
    } else if (this.x > section.w - r) {
      this.x = section.w - r;
      if (this.vx > 0) {
        this.vx = -this.vx;
      }
    }
    if (this.y < r) {
      this.y = r;
      if (this.vy < 0) {
        this.vy = -this.vy;
      }
    } else if (this.y > section.h - r) {
      this.y = section.h - r;
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
    for (let i = 0; i < this.walls.length; i++) {
      const w = this.walls[i];
      lineSet(
        this.worldWalls[i],
        w.a.x * ca - w.a.y * sa + wx,
        w.a.x * sa + w.a.y * ca + wy,
        w.b.x * ca - w.b.y * sa + wx,
        w.b.x * sa + w.b.y * ca + wy
      );
    }
    const hit = resolveBallWalls(
      ball,
      this.worldWalls,
      vecCreate(
        this.vx - this.omega * (ball.pos.y - wy),
        this.vy + this.omega * (ball.pos.x - wx)
      )
    );
    if (hit && !this.touching) {
      this.onHit();
    }
    this.touching = hit;
  }
}

export const makeCircleWalls = (r: number, n: number, rest: number): Line[] => {
  const walls: Line[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    walls.push(
      lineCreate(
        r * Math.cos(a0),
        r * Math.sin(a0),
        r * Math.cos(a1),
        r * Math.sin(a1),
        rest
      )
    );
  }
  return walls;
};

/** Radial paddles from the hub out to `r`, evenly spaced around the circle. */
export const makeFanWalls = (r: number, paddles: number, rest: number): Line[] => {
  const n = paddles < 1 ? 1 : paddles | 0;
  const walls: Line[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    walls.push(lineCreate(0, 0, r * Math.cos(a), r * Math.sin(a), rest));
  }
  return walls;
};

export const makeCircle = (
  x: number,
  y: number,
  resolution: number,
  restitution: number,
  radius: number,
  vx = 0,
  vy = 0,
  omega = 0
) => {
  const o = new Obstacle(
    x,
    y,
    PART_OBSTACLE,
    makeCircleWalls(radius, resolution, restitution),
    vx,
    vy,
    omega
  );
  o.r = radius;
  return o;
};

export const makeFan = (
  x: number,
  y: number,
  paddles: number,
  restitution: number,
  radius: number,
  vx = 0,
  vy = 0,
  omega = 0
) => {
  const o = new Obstacle(
    x,
    y,
    PART_OBSTACLE,
    makeFanWalls(radius, paddles, restitution),
    vx,
    vy,
    omega
  );
  o.r = radius;
  return o;
};

/** A round bumper: n-gon walls, flashes and kicks the ball back on contact. */
export const makeBumper = (
  x: number,
  y: number,
  r: number,
  n: number,
  rest = 1.2,
  vx = 0,
  vy = 0,
  omega = 0
) => {
  const o = new Obstacle(
    x,
    y,
    PART_OBSTACLE,
    makeCircleWalls(r, n, rest),
    vx,
    vy,
    omega
  );
  o.r = r;
  return o;
};
