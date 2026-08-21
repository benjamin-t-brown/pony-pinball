import type { Circle } from '../../sim/physics';
import { PART_COLLECTABLE, Part } from '../Part';
import type { Section } from '../Section';
import type { Trigger } from '../Trigger';

export class Collectable extends Part {
  r = 12;
  groupType = 0;
  taken = false;
  trigger: Trigger | null = null;

  constructor(x: number, y: number, r: number, groupType: number) {
    super(x, y, PART_COLLECTABLE);
    this.active = true;
    this.r = r;
    this.groupType = groupType;
  }

  preBall(
    ball: Circle,
    ox: number,
    oy: number,
    _dtSeconds: number,
    g: number,
    section: Section,
    state?: { collected: number[]; sections: Section[] }
  ) {
    if (this.taken || !state) {
      return g;
    }
    const dx = ball.pos.x - (this.x + ox);
    const dy = ball.pos.y - (this.y + oy);
    const hitR = this.r + ball.r;
    if (dx * dx + dy * dy > hitR * hitR) {
      return g;
    }
    this.taken = true;
    this.active = false;
    const gt = this.groupType;
    while (state.collected.length <= gt) {
      state.collected.push(0);
    }
    state.collected[gt]++;
    if (this.trigger) {
      this.trigger.onCollect(section, state, gt);
    }
    return g;
  }
}
