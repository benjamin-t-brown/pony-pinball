import type { Circle } from '../../sim/PhysicsFuncs';
import { Part } from '../Part';
import type { Section } from '../SectionFuncs';
import type { Trigger } from '../Trigger';
import { playSound, SOUND_GET_COIN } from '../../audio/SoundFuncs';
import { collectPoints, goalOf } from '../../machine/MachineGoals';
import type { MachineGoal } from '../../machine/MachineTypes';

export class Collectable extends Part {
  r = 12;
  groupType = 0;
  taken = false;
  trigger: Trigger | null = null;

  constructor(x: number, y: number, r: number, groupType: number) {
    super(x, y);
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
    state?: {
      collected: number[];
      sections: Section[];
      score?: number;
      machine?: { goal: MachineGoal };
    }
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
    playSound(SOUND_GET_COIN);
    const gt = this.groupType;
    while (state.collected.length <= gt) {
      state.collected.push(0);
    }
    state.collected[gt]++;
    if (state.machine && state.score != null) {
      state.score = (state.score || 0) + collectPoints(goalOf(state.machine));
    }
    if (this.trigger) {
      this.trigger.onCollect(section, state, gt);
    }
    return g;
  }
}
