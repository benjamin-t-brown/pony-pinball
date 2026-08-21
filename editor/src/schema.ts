import {
  B_CIRCLE,
  B_CONVEYER,
  B_FIELD,
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_WALLS,
} from '@game/model/builders';
import {
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_MOVE_DOOR,
} from '@game/model/Trigger';
import {
  LAUNCHER_FORCE,
  LAUNCHER_RANGE,
  LEFT_REST_ANGLE,
  LEFT_UP,
} from '@game/model/constants';

export type ParamDef = {
  name: string;
  step?: number;
};

export type BuilderDef = {
  id: number;
  name: string;
  place: 'point' | 'segment' | 'rect';
  params: ParamDef[];
};

export const BUILDER_DEFS: BuilderDef[] = [
  {
    id: B_WALLS,
    name: 'Walls',
    place: 'segment',
    params: [],
  },
  {
    id: B_FLIPPER_LEFT,
    name: 'Flipper',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'restAngle', step: 0.05 },
      { name: 'upAngle', step: 0.05 },
      { name: 'isFlipped', step: 1 },
    ],
  },
  {
    id: B_LAUNCHER,
    name: 'Launcher',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'dx', step: 0.1 },
      { name: 'dy', step: 0.1 },
      { name: 'force' },
      { name: 'range' },
    ],
  },
  {
    id: B_FIELD,
    name: 'Trigger',
    place: 'rect',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'w' },
      { name: 'h' },
      { name: 'trigger', step: 1 },
    ],
  },
  {
    id: B_CONVEYER,
    name: 'Conveyer',
    place: 'rect',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'w' },
      { name: 'h' },
      { name: 'angle', step: 0.05 },
      { name: 'power' },
      { name: 'maxSpeed' },
      { name: 'drag', step: 0.5 },
    ],
  },
  {
    id: B_CIRCLE,
    name: 'Circle',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'resolution', step: 1 },
      { name: 'restitution', step: 0.05 },
      { name: 'radius' },
      { name: 'dx' },
      { name: 'dy' },
      { name: 'omega', step: 0.05 },
    ],
  },
];

export const TRIGGER_DEFS = [
  {
    id: TRIGGER_DEACTIVATE_WALL,
    name: 'TRIGGER_DEACTIVATE_WALL',
    args: ['wall', 'onDelay', 'offDelay'],
  },
  {
    id: TRIGGER_MOVE_DOOR,
    name: 'TRIGGER_MOVE_DOOR',
    args: ['wall', 'dx', 'dy'],
  },
];

export const triggerDefFor = (id: number) => {
  for (let i = 0; i < TRIGGER_DEFS.length; i++) {
    if (TRIGGER_DEFS[i].id === id) {
      return TRIGGER_DEFS[i];
    }
  }
  return TRIGGER_DEFS[0];
};

export const placeDefaults = (id: number, x: number, y: number): number[] => {
  if (id === B_FLIPPER_LEFT) {
    return [B_FLIPPER_LEFT, x, y, LEFT_REST_ANGLE, LEFT_UP, 0];
  }
  if (id === B_LAUNCHER) {
    return [B_LAUNCHER, x, y, 0, -1, LAUNCHER_FORCE, LAUNCHER_RANGE];
  }
  if (id === B_CIRCLE) {
    return [B_CIRCLE, x, y, 10, 1, 20, 0, 0, 0];
  }
  if (id === B_FIELD) {
    const trig = triggerDefFor(TRIGGER_DEACTIVATE_WALL);
    const extra = [];
    for (let i = 0; i < trig.args.length; i++) {
      extra.push(0);
    }
    return [B_FIELD, x, y, 80, 80, trig.id, ...extra];
  }
  if (id === B_CONVEYER) {
    return [B_CONVEYER, x, y, 80, 80, 0, 400, 160, 6];
  }
  return [id, x, y];
};

export const ensureCallArgs = (call: number[]) => {
  if (call[0] === B_WALLS) {
    return call.slice();
  }
  const full = placeDefaults(call[0], call[1] ?? 0, call[2] ?? 0);
  const next = call.slice();
  while (next.length < full.length) {
    next.push(full[next.length]);
  }
  if (call[0] === B_FIELD) {
    const trig = triggerDefFor(next[5]);
    const n = 6 + trig.args.length;
    while (next.length < n) {
      next.push(0);
    }
    next.length = n;
  }
  return next;
};

export const defFor = (id: number) => {
  for (let i = 0; i < BUILDER_DEFS.length; i++) {
    if (BUILDER_DEFS[i].id === id) {
      return BUILDER_DEFS[i];
    }
  }
  return null;
};
