import {
  partIdOf,
  setPartId,
  setWallIdAt,
  wallIdAt,
} from '@game/machine/EntityIdFuncs';
import {
  builderIdToKind,
  callAnchor,
  type MachineCall,
} from '@game/machine/MachineCalls';
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
      { name: 'flipped', step: 1 },
      { name: 'length' },
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
      { name: 'length' },
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
    ],
  },
  {
    id: B_COLLECTABLE,
    name: 'Collectable',
    place: 'point',
    params: [{ name: 'x' }, { name: 'y' }],
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
      { name: 'rot', step: 0.05 },
      { name: 'resti0', step: 0.05 },
      { name: 'resti1', step: 0.05 },
      { name: 'resti2', step: 0.05 },
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
      { name: 'decoration' },
      { name: 'texture', step: 1 },
    ],
  },
];

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
    args: [],
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

export const isDecLightLine = (call: MachineCall) => {
  return call.kind === B_DECORATION && call.decoration === DEC_BLINKING_LIGHT_LINE;
};

export const isDecRainbow = (call: MachineCall) => {
  return call.kind === B_DECORATION && call.decoration === DEC_RAINBOW;
};

export const decArgDefault = (name: string, call: MachineCall) => {
  if (name === 'interval') {
    return call.kind === B_DECORATION && call.decoration === DEC_BLINKING_LIGHT_LINE
      ? 400
      : 1000;
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
    const a = callAnchor(call);
    return (a ? a.x : 0) + 80;
  }
  if (name === 'y1') {
    const a = callAnchor(call);
    return a ? a.y : 0;
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
    id: TRIGGER_PLAY_SOUND,
    name: 'TRIGGER_PLAY_SOUND',
    args: ['sound'],
  },
];

export const SOUND_DEFS = [
  { id: 0, name: 'hit small circle', key: 'SOUND_HIT_SMALL_CIRCLE' },
  { id: 1, name: 'launch', key: 'SOUND_LAUNCH' },
  { id: 2, name: 'launch pull back', key: 'SOUND_LAUNCH_PULL_BACK' },
  { id: 3, name: 'start game', key: 'SOUND_START_GAME' },
  { id: 4, name: 'ball traveling', key: 'SOUND_BALL_TRAVELING' },
  { id: 5, name: 'get coin', key: 'SOUND_GET_COIN' },
  { id: 6, name: 'secret', key: 'SOUND_SECRET' },
  { id: 7, name: 'paddle flipper', key: 'SOUND_PADDLE_FLIPPER' },
  { id: 8, name: 'paddle flipper down', key: 'SOUND_PADDLE_FLIPPER_DOWN' },
  { id: 9, name: 'portal in', key: 'SOUND_PORTAL_IN' },
  { id: 10, name: 'portal out', key: 'SOUND_PORTAL_OUT' },
  { id: 11, name: 'hit fan', key: 'SOUND_HIT_FAN' },
  { id: 12, name: 'game win', key: 'SOUND_GAME_WIN' },
];

export const triggerArgDefault = (name: string, call: MachineCall) => {
  if (name === 'destX') {
    const a = callAnchor(call);
    return (a ? a.x : 0) + 80 + 40;
  }
  if (name === 'destY') {
    const a = callAnchor(call);
    return a ? a.y : 0;
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

export const placeCall = (
  kind: MachineCall['kind'],
  x: number,
  y: number
): MachineCall => {
  if (kind === B_FLIPPER_LEFT) {
    return {
      kind,
      x,
      y,
      restAngle: LEFT_REST_ANGLE,
      upAngle: LEFT_UP,
      flipped: false,
      length: PADDLE_LEN,
    };
  }
  if (kind === B_LAUNCHER) {
    return {
      kind,
      x,
      y,
      dx: 0,
      dy: -1,
      force: LAUNCHER_FORCE,
      range: LAUNCHER_RANGE,
      chargeMs: LAUNCHER_CHARGE_MS,
      length: LAUNCHER_LEN,
    };
  }
  if (kind === B_CIRCLE) {
    return {
      kind,
      x,
      y,
      resolution: 10,
      restitution: 1,
      radius: 20,
      dx: 0,
      dy: 0,
      omega: 0,
      icon: 0,
      color: 0,
    };
  }
  if (kind === B_FAN) {
    return {
      kind,
      x,
      y,
      paddles: 4,
      restitution: 1,
      radius: 40,
      omega: 1,
    };
  }
  if (kind === B_FIELD) {
    return {
      kind,
      x,
      y,
      w: 80,
      h: 80,
      trigger: TRIGGER_DEACTIVATE_WALL,
      wall: 0,
      onDelay: 0,
      offDelay: 0,
    };
  }
  if (kind === B_CONVEYER) {
    return {
      kind,
      x,
      y,
      w: 80,
      h: 80,
      angle: 0,
      power: 400,
      maxSpeed: 160,
      drag: 6,
    };
  }
  if (kind === B_WALL_RESTI) {
    return { kind, x0: x, y0: y, x1: x + 40, y1: y, rest: 0.5 };
  }
  if (kind === B_WALL_GATE) {
    return { kind, x0: x, y0: y, x1: x + 40, y1: y, color: 0 };
  }
  if (kind === B_COLLECTABLE) {
    return { kind, x, y };
  }
  if (kind === B_PORTAL) {
    return { kind, x0: x, y0: y, x1: x + 80, y1: y, color: 0 };
  }
  if (kind === B_TRIANGLE) {
    return {
      kind,
      x,
      y,
      sideLen1: 60,
      sideLen2: 60,
      rot: 0,
      resti0: 0.5,
      resti1: 0.5,
      resti2: 0.5,
    };
  }
  if (kind === B_DECORATION) {
    return {
      kind,
      x,
      y,
      scale: 1,
      rot: 0,
      decoration: DEC_BLINKING_LIGHT,
      texture: 0,
      shape: SHAPE_CHEVRON,
      startOn: 1,
      interval: 1000,
    };
  }
  if (kind === B_WALLS) {
    return { kind, segments: [] };
  }
  return { kind: B_COLLECTABLE, x, y };
};

export const placeDefaults = (id: number, x: number, y: number): MachineCall => {
  return placeCall(builderIdToKind(id), x, y);
};

export const ensureCallArgs = (raw: MachineCall): MachineCall => {
  const a = callAnchor(raw) || { x: 0, y: 0 };
  const full = placeCall(raw.kind, a.x, a.y);
  const next = { ...full, ...raw } as MachineCall;
  if (next.kind === B_FIELD) {
    const savedId = partIdOf(next);
    if (savedId) {
      setPartId(next, savedId);
    }
  }
  if (next.kind === B_WALL_RESTI || next.kind === B_WALL_GATE) {
    const saved = wallIdAt(raw, 0);
    if (saved) {
      setWallIdAt(next, 0, saved);
    }
  }
  if (next.kind === B_TRIANGLE) {
    setWallIdAt(next, 0, wallIdAt(raw, 0));
    setWallIdAt(next, 1, wallIdAt(raw, 1));
    setWallIdAt(next, 2, wallIdAt(raw, 2));
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
