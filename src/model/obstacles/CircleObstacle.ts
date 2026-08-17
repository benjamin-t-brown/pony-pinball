import { Line, lineCreate } from '../../sim/physics';
import type { Section } from '../Section';
import { Obstacle } from './Obstacle';

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

export class CircleObstacle extends Obstacle {
  flash = 0;

  constructor(
    x: number,
    y: number,
    r: number,
    n: number,
    rest = 1.2,
    vx = 0,
    vy = 0,
    omega = 0
  ) {
    super(x, y, makeCircleWalls(r, n, rest), vx, vy, omega);
  }

  onHit() {
    this.activate();
    this.flash = 120;
  }

  update(dt: number, section: Section) {
    super.update(dt, section);
    if (this.flash > 0) {
      this.flash -= dt;
      if (this.flash <= 0) {
        this.unactivate();
      }
    }
  }
}
