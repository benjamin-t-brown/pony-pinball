import {
  B_CIRCLE,
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_WALLS,
} from '@game/model/builders';
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
  place: 'point' | 'segment';
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
