import {
  type Circle,
  Line,
  Vec,
  lineCreate,
  lineClosestPointT,
  lineSet,
  resolveCircleSurface,
  vecCreate,
  vecLen,
  vecMul,
  vecSub,
} from '../../sim/physics';
import {
  PADDLE_FRICTION,
  PADDLE_HALF_WIDTH,
  PADDLE_LEN,
  PADDLE_REST,
  PADDLE_RETURN,
  PADDLE_SPEED,
} from '../constants';
import { PART_PADDLE, Part } from '../Part';
import { playSound, SOUND_PADDLE_FLIPPER } from '../../zzfx';

export class Paddle extends Part {
  angle = 0;
  prevAngle = 0;
  restAngle = 0;
  upAngle = 0;
  len = PADDLE_LEN;
  omega = 0;
  line: Line;
  worldLine: Line;

  constructor(
    x: number,
    y: number,
    control: number,
    restAngle: number,
    upAngle: number,
    len = PADDLE_LEN
  ) {
    super(x, y, PART_PADDLE, control);
    this.restAngle = restAngle;
    this.upAngle = upAngle;
    this.len = len;
    this.angle = restAngle;
    this.prevAngle = restAngle;
    this.line = lineCreate(x, y, x, y);
    this.worldLine = lineCreate(x, y, x, y, PADDLE_REST);
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

  activate() {
    if (!this.active) {
      playSound(SOUND_PADDLE_FLIPPER);
    }
    this.active = true;
  }

  /** Velocity of the paddle's surface at a world point: omega cross r. */
  getSurfaceVel(p: Vec, pivotX: number, pivotY: number) {
    return vecCreate(
      -this.omega * (p.y - pivotY),
      this.omega * (p.x - pivotX)
    );
  }

  /**
   * Which face of the paddle a world point lies on, +1 or -1, measured against
   * the paddle at `angle`.
   */
  sideOf(p: Vec, pivotX: number, pivotY: number, angle: number) {
    const cross =
      Math.cos(angle) * (p.y - pivotY) - Math.sin(angle) * (p.x - pivotX);
    return cross < 0 ? -1 : 1;
  }

  affectBall(ball: Circle, ox: number, oy: number) {
    const pivotX = this.x + ox;
    const pivotY = this.y + oy;
    const dirX = Math.cos(this.angle);
    const dirY = Math.sin(this.angle);
    lineSet(
      this.worldLine,
      pivotX,
      pivotY,
      pivotX + this.len * dirX,
      pivotY + this.len * dirY
    );

    const reach = ball.r + PADDLE_HALF_WIDTH;
    const { point, t } = lineClosestPointT(this.worldLine, ball.pos);
    const diff = vecSub(ball.pos, point);
    const dist = vecLen(diff);
    if (dist >= reach) {
      return;
    }

    // Orient the normal by the face the ball was on *before* this step's sweep.
    // Deriving it from the current position flips it the moment the paddle
    // rotates past the ball's centre, and the correction then fires the ball
    // back into the swept path to be hit again — the stick-and-drag artifact.
    const side = this.sideOf(ball.pos, pivotX, pivotY, this.prevAngle);
    const faceN = vecCreate(-dirY * side, dirX * side);

    // Along the paddle's length the contact is against its flat face; past
    // either end it is against a round cap, so the normal is radial there.
    const n =
      t > 0 && t < 1
        ? faceN
        : dist > 1e-6
          ? vecMul(diff, 1 / dist)
          : faceN;

    // Signed depth: negative dot means the sweep has already carried the paddle
    // through the ball, so push it back out the side it entered from.
    const depth = reach - (diff.x * n.x + diff.y * n.y);

    resolveCircleSurface(
      ball,
      n,
      depth,
      PADDLE_REST,
      PADDLE_FRICTION,
      this.getSurfaceVel(point, pivotX, pivotY)
    );
  }

  update(dt: number) {
    const dtSeconds = dt / 1000;
    this.prevAngle = this.angle;
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
