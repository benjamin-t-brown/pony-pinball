import type { Circle } from '../sim/PhysicsFuncs';
import type { Section } from './SectionFuncs';

export const CONTROL_LEFT = 0;
export const CONTROL_RIGHT = 1;
export const CONTROL_START = 2;
/** Not player-driven. The input gate in updateParts skips these. */
export const CONTROL_NONE = -1;

/**
 * Something in a section that can tick, overlap the ball, or draw.
 * A new kind is a subclass (and a view class under `src/ui/parts/`), not a
 * `type` integer and another switch in PartElement.
 */
export class Part {
  x = 0;
  y = 0;
  control = CONTROL_NONE;
  active = false;
  /** Stable id for trigger / collect-goal refs. 0 = none. */
  id = 0;
  /** 0..1. Default 1. Shared by every part kind. */
  opacity = 1;

  constructor(x: number, y: number, control = CONTROL_NONE) {
    this.x = x;
    this.y = y;
    this.control = control;
  }

  activate() {
    this.active = true;
  }

  unactivate() {
    this.active = false;
  }

  /** Player input just turned this on (edge). */
  onControlOn() {}

  /** Player input just turned this off (edge). */
  onControlOff() {}

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
    _section: Section,
    _state?: { collected: number[]; sections: Section[] }
  ) {
    return g;
  }

  /** After the physics step: launchers apply a pending fire. */
  affectBall(_ball: Circle, _ox: number, _oy: number) {}
}
