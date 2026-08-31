import { Line, lineCreate, lineSet } from '../../sim/PhysicsFuncs';
import { PADDLE_LEN, PADDLE_RETURN, PADDLE_SPEED } from '../constants';
import { Part } from '../Part';
import { playSound, SOUND_PADDLE_FLIPPER, SOUND_PADDLE_FLIPPER_DOWN } from '../../audio/SoundFuncs';

export class Paddle extends Part {
  angle = 0;
  prevAngle = 0;
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
    upAngle: number,
    len = PADDLE_LEN
  ) {
    super(x, y, control);
    this.restAngle = restAngle;
    this.upAngle = upAngle;
    this.len = len;
    this.angle = restAngle;
    this.prevAngle = restAngle;
    this.line = lineCreate(x, y, x, y);
    this.syncLine();
  }

  onControlOn() {
    playSound(SOUND_PADDLE_FLIPPER);
  }

  onControlOff() {
    playSound(SOUND_PADDLE_FLIPPER_DOWN);
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
