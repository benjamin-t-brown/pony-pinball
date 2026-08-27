import {
  B_CIRCLE,
  B_COLLECTABLE,
  B_CONVEYER,
  B_DECORATION,
  B_FAN,
  B_FIELD,
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_PORTAL,
  B_TRIANGLE,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
  GATE_COLORS,
} from '@game/model/builders';
import {
  DEC_BLINKING_LIGHT,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
  SHAPE_CHEVRON,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
} from '@game/model/parts/Decoration';
import {
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_GATE_SECTION_4,
  TRIGGER_MOVE_BALL,
  TRIGGER_MOVE_DOOR,
  TRIGGER_PLAY_SOUND,
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
      { name: 'icon', step: 1 },
      { name: 'color', step: 1 },
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
      { name: 'omega', step: 0.05 },
      { name: 'dx' },
      { name: 'dy' },
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
  {
    id: B_PORTAL,
    name: 'Portal',
    place: 'segment',
    params: [
      { name: 'x0' },
      { name: 'y0' },
      { name: 'x1' },
      { name: 'y1' },
      { name: 'radius' },
      { name: 'color', step: 1 },
    ],
  },
  {
    id: B_TRIANGLE,
    name: 'Triangle',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'sideLen1' },
      { name: 'sideLen2' },
      { name: 'startingRotation', step: 0.05 },
      { name: 'resti0', step: 0.05 },
      { name: 'resti1', step: 0.05 },
      { name: 'resti2', step: 0.05 },
      { name: 'color', step: 1 },
    ],
  },
  {
    id: B_DECORATION,
    name: 'Decoration',
    place: 'point',
    params: [
      { name: 'x' },
      { name: 'y' },
      { name: 'scale', step: 0.1 },
      { name: 'rot', step: 0.05 },
      { name: 'decorationType', step: 1 },
      { name: 'texture', step: 1 },
    ],
  },
];

export { GATE_COLORS };

export const DECORATION_DEFS = [
  {
    id: DEC_BLINKING_LIGHT,
    name: 'Blinking light',
    args: ['shape', 'startOn', 'interval'],
  },
  {
    id: DEC_BLINKING_LIGHT_LINE,
    name: 'Blinking light line',
    args: ['interval', 'shape', 'count', 'x1', 'y1', 'delay', 'startOn'],
  },
  {
    id: DEC_ICON,
    name: 'Icon',
    args: ['opacity'],
  },
  {
    id: DEC_RAINBOW,
    name: 'Rainbow',
    args: ['w', 'h'],
  },
];

export const CIRCLE_ICON_DEFS = [
  { id: 0, name: 'smiley' },
  { id: 1, name: 'diamond' },
];

export const SHAPE_DEFS = [
  { id: SHAPE_CHEVRON, name: 'chevron' },
  { id: SHAPE_CIRCLE, name: 'circle' },
  { id: SHAPE_SQUARE, name: 'square' },
];

export const isDecLightLine = (call: number[]) => {
  return call[0] === B_DECORATION && (call[5] | 0) === DEC_BLINKING_LIGHT_LINE;
};

export const isDecRainbow = (call: number[]) => {
  return call[0] === B_DECORATION && (call[5] | 0) === DEC_RAINBOW;
};

export const decArgDefault = (name: string, call: number[]) => {
  if (name === 'interval') {
    return (call[5] | 0) === DEC_BLINKING_LIGHT_LINE ? 400 : 1000;
  }
  if (name === 'count') {
    return 5;
  }
  if (name === 'delay') {
    return 0;
  }
  if (name === 'startOn') {
    return 1;
  }
  if (name === 'x1') {
    return (call[1] || 0) + 80;
  }
  if (name === 'y1') {
    return call[2] || 0;
  }
  if (name === 'opacity') {
    return 1;
  }
  if (name === 'w') {
    return 80;
  }
  if (name === 'h') {
    return 40;
  }
  return 0;
};

export const decorationDefFor = (id: number) => {
  for (let i = 0; i < DECORATION_DEFS.length; i++) {
    if (DECORATION_DEFS[i].id === id) {
      return DECORATION_DEFS[i];
    }
  }
  return DECORATION_DEFS[0];
};

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
  {
    id: TRIGGER_ACTIVATE_LIGHT,
    name: 'TRIGGER_ACTIVATE_LIGHT',
    args: ['part', 'onDelay', 'offDelay'],
  },
  {
    id: TRIGGER_MOVE_BALL,
    name: 'TRIGGER_MOVE_BALL',
    args: ['destX', 'destY', 'destW', 'destH'],
  },
  {
    id: TRIGGER_PLAY_SOUND,
    name: 'TRIGGER_PLAY_SOUND',
    args: ['sound'],
  },
];

export const SOUND_DEFS = [
  { id: 0, name: 'gate closed', key: 'SOUND_GATE_CLOSED' },
  { id: 1, name: 'hit small circle', key: 'SOUND_HIT_SMALL_CIRCLE' },
  { id: 2, name: 'launch', key: 'SOUND_LAUNCH' },
  { id: 3, name: 'launch pull back', key: 'SOUND_LAUNCH_PULL_BACK' },
  { id: 4, name: 'start game', key: 'SOUND_START_GAME' },
  { id: 5, name: 'ball traveling', key: 'SOUND_BALL_TRAVELING' },
  { id: 6, name: 'get coin', key: 'SOUND_GET_COIN' },
  { id: 7, name: 'secret', key: 'SOUND_SECRET' },
  { id: 8, name: 'gate open', key: 'SOUND_GATE_OPEN' },
  { id: 9, name: 'paddle flipper', key: 'SOUND_PADDLE_FLIPPER' },
  { id: 10, name: 'paddle flipper down', key: 'SOUND_PADDLE_FLIPPER_DOWN' },
  { id: 11, name: 'portal in', key: 'SOUND_PORTAL_IN' },
  { id: 12, name: 'portal out', key: 'SOUND_PORTAL_OUT' },
  { id: 13, name: 'hit fan', key: 'SOUND_HIT_FAN' },
  { id: 14, name: 'game win', key: 'SOUND_GAME_WIN' },
];

export const isMoveBallField = (call: number[]) => {
  return call[0] === B_FIELD && (call[5] | 0) === TRIGGER_MOVE_BALL;
};

export const triggerArgDefault = (name: string, call: number[]) => {
  if (name === 'destX') {
    return (call[1] || 0) + (call[3] || 80) + 40;
  }
  if (name === 'destY') {
    return call[2] || 0;
  }
  if (name === 'destW' || name === 'destH') {
    return 80;
  }
  if (name === 'sound') {
    return 8;
  }
  return 0;
};

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
    return [B_CIRCLE, x, y, 10, 1, 20, 0, 0, 0, 0, 0];
  }
  if (id === B_FAN) {
    return [B_FAN, x, y, 4, 1, 40, 1, 0, 0];
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
  if (id === B_PORTAL) {
    return [B_PORTAL, x, y, x + 80, y, 18, 0];
  }
  if (id === B_TRIANGLE) {
    return [B_TRIANGLE, x, y, 60, 60, 0, 0.5, 0.5, 0.5, 0];
  }
  if (id === B_DECORATION) {
    const dec = decorationDefFor(DEC_BLINKING_LIGHT);
    const extra = [];
    for (let i = 0; i < dec.args.length; i++) {
      extra.push(decArgDefault(dec.args[i], [B_DECORATION, x, y]));
    }
    return [B_DECORATION, x, y, 1, 0, DEC_BLINKING_LIGHT, 0, ...extra];
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
      next.push(triggerArgDefault(trig.args[next.length - 6], next));
    }
    next.length = n;
  }
  if (call[0] === B_COLLECTABLE) {
    next.length = 6;
  }
  if (call[0] === B_WALL_RESTI || call[0] === B_WALL_GATE) {
    next.length = 6;
  }
  if (call[0] === B_PORTAL) {
    next.length = 7;
  }
  if (call[0] === B_TRIANGLE) {
    next.length = 10;
  }
  if (call[0] === B_DECORATION) {
    const dec = decorationDefFor(next[5]);
    const n = 7 + dec.args.length;
    while (next.length < n) {
      next.push(decArgDefault(dec.args[next.length - 7], next));
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
