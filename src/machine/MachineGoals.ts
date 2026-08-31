import type { MachineGoal, MachineHud } from './MachineTypes';
import {
  GOAL_PACHINKO,
  GOAL_PINBALL,
  GOAL_SECTION,
} from './MachineTypes';

export { GOAL_PACHINKO, GOAL_PINBALL, GOAL_SECTION };

export const DEFAULT_BALLS = 3;

export const GOAL_DEFS: { kind: number; label: string }[] = [
  { kind: GOAL_SECTION, label: 'Reach section' },
  { kind: GOAL_PINBALL, label: 'Pinball (high score)' },
  { kind: GOAL_PACHINKO, label: 'Pachinko (tickets)' },
];

export const cloneGoal = (goal: MachineGoal): MachineGoal => {
  if (goal.kind === GOAL_PINBALL) {
    return { kind: GOAL_PINBALL, balls: goal.balls };
  }
  if (goal.kind === GOAL_PACHINKO) {
    return { kind: GOAL_PACHINKO, balls: goal.balls };
  }
  return { kind: GOAL_SECTION, section: goal.section };
};

export const goalOf = (machine: {
  goal?: MachineGoal;
  completeSection?: number;
}): MachineGoal => {
  if (machine.goal) {
    return cloneGoal(machine.goal);
  }
  return { kind: GOAL_SECTION, section: machine.completeSection || 0 };
};

export const completeSectionOf = (machine: {
  goal?: MachineGoal;
  completeSection?: number;
}) => {
  const goal = goalOf(machine);
  if (goal.kind !== GOAL_SECTION) {
    return -1;
  }
  return goal.section;
};

export const ballsOf = (goal: MachineGoal) => {
  if (goal.kind === GOAL_SECTION) {
    return 0;
  }
  return goal.balls > 0 ? goal.balls : DEFAULT_BALLS;
};

export const goalUsesBalls = (goal: MachineGoal) => {
  return goal.kind === GOAL_PINBALL || goal.kind === GOAL_PACHINKO;
};

export const goalHigherIsBetter = (goal: MachineGoal) => {
  return goal.kind !== GOAL_SECTION;
};

export const goalForKind = (
  kind: number,
  prev: MachineGoal
): MachineGoal => {
  const balls = ballsOf(prev) || DEFAULT_BALLS;
  if (kind === GOAL_PINBALL) {
    return { kind: GOAL_PINBALL, balls };
  }
  if (kind === GOAL_PACHINKO) {
    return { kind: GOAL_PACHINKO, balls };
  }
  const section = prev.kind === GOAL_SECTION ? prev.section : 0;
  return { kind: GOAL_SECTION, section };
};

export const hudForGoal = (kind: number): MachineHud => {
  if (kind === GOAL_PACHINKO) {
    return { flippers: false, launcher: true };
  }
  return { flippers: true, launcher: true };
};

export const playLabel = (goal: MachineGoal) => {
  if (goal.kind === GOAL_PINBALL) {
    return 'score';
  }
  if (goal.kind === GOAL_PACHINKO) {
    return 'tickets';
  }
  return 'time';
};

export const collectPoints = (goal: MachineGoal) => {
  if (goal.kind === GOAL_PINBALL) {
    return 50;
  }
  if (goal.kind === GOAL_PACHINKO) {
    return 1;
  }
  return 0;
};

export const hitPoints = (goal: MachineGoal, circle: boolean, fan: boolean) => {
  if (goal.kind !== GOAL_PINBALL) {
    return 0;
  }
  if (circle) {
    return 100;
  }
  if (fan) {
    return 25;
  }
  return 10;
};
