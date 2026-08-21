import {
  B_CIRCLE,
  B_COLLECTABLE,
  B_CONVEYER,
  B_FAN,
  B_FIELD,
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
  GATE_COLORS,
} from '@game/model/builders';
import {
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_GATE_SECTION_4,
  TRIGGER_MOVE_DOOR,
} from '@game/model/Trigger';
import {
  LAUNCHER_CHARGE_MS,
  LAUNCHER_FORCE,
  LAUNCHER_LEN,
  LAUNCHER_RANGE,
  LEFT_REST_ANGLE,
  LEFT_UP,
  PADDLE_LEN,
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
    id: B_WALL_RESTI,
    name: 'Wall resti',
    place: 'segment',
    params: [
      { name: 'x0' },
      { name: 'y0' },
      { name: 'x1' },
      { name: 'y1' },
      { name: 'restitution', step: 0.05 },
    ],
  },
  {
    id: B_WALL_GATE,
    name: 'Wall gate',
    place: 'segment',
    params: [
      { name: 'x0' },
      { name: 'y0' },
      { name: 'x1' },
      { name: 'y1' },
      { name: 'color', step: 1 },
    ],
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
      { name: 'flipperLength' },
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
      { name: 'chargeMs' },
      { name: 'launcherLength' },
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
  {
    id: B_FAN,
    name: 'Fan',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'paddles', step: 1 },
      { name: 'restitution', step: 0.05 },
      { name: 'radius' },
      { name: 'dx' },
      { name: 'dy' },
      { name: 'omega', step: 0.05 },
    ],
  },
  {
    id: B_COLLECTABLE,
    name: 'Collectable',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'radius' },
      { name: 'groupType', step: 1 },
      { name: 'trigger', step: 1 },
    ],
  },
];

export { GATE_COLORS };

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
  {
    id: TRIGGER_GATE_SECTION_4,
    name: 'TRIGGER_GATE_SECTION_4',
    args: [],
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
    return [B_FLIPPER_LEFT, x, y, LEFT_REST_ANGLE, LEFT_UP, 0, PADDLE_LEN];
  }
  if (id === B_LAUNCHER) {
    return [
      B_LAUNCHER,
      x,
      y,
      0,
      -1,
      LAUNCHER_FORCE,
      LAUNCHER_RANGE,
      LAUNCHER_CHARGE_MS,
      LAUNCHER_LEN,
    ];
  }
  if (id === B_CIRCLE) {
    return [B_CIRCLE, x, y, 10, 1, 20, 0, 0, 0];
  }
  if (id === B_FAN) {
    return [B_FAN, x, y, 4, 1, 40, 0, 0, 1];
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
  if (id === B_WALL_RESTI) {
    return [B_WALL_RESTI, x, y, x + 40, y, 0.5];
  }
  if (id === B_WALL_GATE) {
    return [B_WALL_GATE, x, y, x + 40, y, 0];
  }
  if (id === B_COLLECTABLE) {
    return [B_COLLECTABLE, x, y, 14, 0, TRIGGER_GATE_SECTION_4];
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
  if (call[0] === B_COLLECTABLE) {
    next.length = 6;
  }
  if (call[0] === B_WALL_RESTI || call[0] === B_WALL_GATE) {
    next.length = 6;
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
