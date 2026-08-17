import type { Circle } from '../../sim/physics';

export const CONTROL_LEFT = 0;
export const CONTROL_RIGHT = 1;
export const CONTROL_START = 2;

export const WIDGET_PADDLE = 0;
export const WIDGET_LAUNCHER = 1;

export class Widget {
  x = 0;
  y = 0;
  type = WIDGET_PADDLE;
  control = CONTROL_LEFT;
  active = false;

  constructor(x: number, y: number, type: number, control: number) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.control = control;
  }

  activate() {
    this.active = true;
  }

  unactivate() {
    this.active = false;
  }

  update(_dt: number) {}

  affectBall(_ball: Circle, _ox: number, _oy: number) {}
}
