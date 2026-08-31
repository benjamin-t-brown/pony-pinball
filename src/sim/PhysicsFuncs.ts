export type Vec = { x: number; y: number };

export type Circle = {
  pos: Vec;
  vel: Vec;
  r: number;
};

export type Line = {
  a: Vec;
  b: Vec;
  rest: number;
  /** Palette index for gate walls; -1 = normal wall. */
  color: number;
  /** zzfx id played on bounce; 0 = silent. */
  sound: number;
  /** Stable id for trigger / collect-goal refs. 0 = none. */
  id: number;
};

export const vecCreate = (x = 0, y = 0): Vec => ({ x, y });

export const vecMul = (v: Vec, s: number): Vec => vecCreate(v.x * s, v.y * s);
export const vecLen = (v: Vec): number => Math.hypot(v.x, v.y);
export const vecNorm = (v: Vec): Vec => vecMul(v, 1 / (vecLen(v) || 1));

export const circleCreate = (x: number, y: number, r: number): Circle => ({
  pos: vecCreate(x, y),
  vel: vecCreate(),
  r,
});

export const GRAVITY = 950;

export const lineCreate = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rest = 0.5,
  color = -1,
  sound = 0,
  id = 0
): Line => ({
  a: vecCreate(x1, y1),
  b: vecCreate(x2, y2),
  rest,
  color,
  sound,
  id,
});

export const lineSet = (
  l: Line,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Line => {
  l.a.x = x1;
  l.a.y = y1;
  l.b.x = x2;
  l.b.y = y2;
  return l;
};
