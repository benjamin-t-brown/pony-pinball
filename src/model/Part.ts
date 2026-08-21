import type { Circle } from '../sim/physics';
import type { Section } from './Section';

export const CONTROL_LEFT = 0;
export const CONTROL_RIGHT = 1;
export const CONTROL_START = 2;
/** Not player-driven. The input gate in updateParts skips these. */
export const CONTROL_NONE = -1;

export const PART_PADDLE = 0;
export const PART_LAUNCHER = 1;
export const PART_OBSTACLE = 2;
export const PART_FIELD = 3;

/**
 * Everything that lives in a Section and can touch the ball: paddles,
 * launchers, bumpers, fields. One list, one loop, one UI element — adding a
 * kind costs a `type` constant and the phases it actually cares about, not a
 * new array, foreach, update pass and element class.
 */
export class Part {
  x = 0;
  y = 0;
  type = PART_PADDLE;
  control = CONTROL_NONE;
  active = false;

  constructor(x: number, y: number, type: number, control = CONTROL_NONE) {
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

  /** Pre-physics tick: move under your own power. */
  update(_dt: number, _section: Section) {}

  /**
   * Pre-integration: apply forces to the ball and return the gravity it should
   * integrate with. Returning `g` untouched opts out of both.
   */
  preBall(
    _ball: Circle,
    _ox: number,
    _oy: number,
    _dtSeconds: number,
    g: number,
    _section: Section
  ) {
    return g;
  }

  /** Post-integration: resolve contact. */
  affectBall(_ball: Circle, _ox: number, _oy: number) {}
}
