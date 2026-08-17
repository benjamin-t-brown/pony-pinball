import {
  type Circle,
  Line,
  Vec,
  lineCreate,
  lineClosestPoint,
  lineSet,
  resolveCircleLine,
  vecCreate,
} from '../../sim/physics';
import { PADDLE_LEN, PADDLE_RETURN, PADDLE_SPEED } from '../constants';
import { WIDGET_PADDLE, Widget } from './Widget';

export class Paddle extends Widget {
  angle = 0;
  restAngle = 0;
  upAngle = 0;
  len = PADDLE_LEN;
  omega = 0;
  line: Line;

  constructor(
    x: number,
    y: number,
    control: number,
    restAngle: number,
    upAngle: number
  ) {
    super(x, y, WIDGET_PADDLE, control);
    this.restAngle = restAngle;
    this.upAngle = upAngle;
    this.angle = restAngle;
    this.line = lineCreate(x, y, x, y);
    this.syncLine();
  }

  syncLine() {
    lineSet(
      this.line,
      this.x,
      this.y,
      this.x + this.len * Math.cos(this.angle),
      this.y + this.len * Math.sin(this.angle)
    );
  }

  getLine() {
    return this.line;
  }

  getSurfaceVel(p: Vec) {
    const rx = p.x - this.x;
    const ry = p.y - this.y;
    return vecCreate(-this.omega * ry, this.omega * rx);
  }

  affectBall(ball: Circle, ox: number, oy: number) {
    const line = this.getLine();
    const worldLine = lineCreate(
      line.a.x + ox,
      line.a.y + oy,
      line.b.x + ox,
      line.b.y + oy,
      line.rest
    );
    const cp = lineClosestPoint(worldLine, ball.pos);
    resolveCircleLine(
      ball,
      worldLine,
      this.getSurfaceVel({ x: cp.x - ox, y: cp.y - oy })
    );
  }

  update(dt: number) {
    const dtSeconds = dt / 1000;
    const target = this.active ? this.upAngle : this.restAngle;
    const speed = this.active ? PADDLE_SPEED : PADDLE_RETURN;
    const maxStep = speed * dtSeconds;
    const diff = target - this.angle;
    if (Math.abs(diff) <= maxStep) {
      this.omega = dtSeconds > 0 ? diff / dtSeconds : 0;
      this.angle = target;
    } else {
      const dir = diff < 0 ? -1 : 1;
      this.omega = dir * speed;
      this.angle += dir * maxStep;
    }
    this.syncLine();
  }
}
