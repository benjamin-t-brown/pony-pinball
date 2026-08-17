export type Vec = { x: number; y: number };

export type Circle = {
  pos: Vec;
  vel: Vec;
  r: number;
  m: number;
  invM: number;
};

export type Line = {
  a: Vec;
  b: Vec;
};

export const vecCreate = (x = 0, y = 0): Vec => ({ x, y });

export const vecAdd = (a: Vec, b: Vec): Vec => vecCreate(a.x + b.x, a.y + b.y);
export const vecSub = (a: Vec, b: Vec): Vec => vecCreate(a.x - b.x, a.y - b.y);
export const vecMul = (v: Vec, s: number): Vec => vecCreate(v.x * s, v.y * s);
export const vecDot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;
export const vecLen = (v: Vec): number => Math.hypot(v.x, v.y);
export const vecNorm = (v: Vec): Vec => vecMul(v, 1 / (vecLen(v) || 1));

export const circleCreate = (
  x: number,
  y: number,
  r: number,
  m = 1
): Circle => ({
  pos: vecCreate(x, y),
  vel: vecCreate(),
  r,
  m,
  invM: 1 / m,
});

export const circleApplyImpulse = (c: Circle, j: Vec): Circle => {
  c.vel = vecAdd(c.vel, vecMul(j, c.invM));
  return c;
};

export const circleIntegrate = (
  c: Circle,
  dt: number,
  gravity = 900
): Circle => {
  c.vel = vecAdd(c.vel, vecMul(vecCreate(0, gravity), dt));
  c.pos = vecAdd(c.pos, vecMul(c.vel, dt));
  return c;
};

export const lineCreate = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Line => ({
  a: vecCreate(x1, y1),
  b: vecCreate(x2, y2),
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

export const lineClosestPoint = (l: Line, p: Vec): Vec => {
  const ab = vecSub(l.b, l.a);
  const abLen2 = vecDot(ab, ab) || 1;
  let t = vecDot(vecSub(p, l.a), ab) / abLen2;
  t = Math.max(0, Math.min(1, t));
  return vecAdd(l.a, vecMul(ab, t));
};

export const resolveCircleLine = (
  c: Circle,
  l: Line,
  restitution = 0.75,
  surfaceVel?: Vec
): boolean => {
  const cp = lineClosestPoint(l, c.pos);
  const diff = vecSub(c.pos, cp);
  const dist = vecLen(diff);
  if (dist >= c.r || dist === 0) {
    return false;
  }

  const n = vecNorm(diff);
  const penetration = c.r - dist;
  c.pos = vecAdd(c.pos, vecMul(n, penetration + 0.01));

  const relVel = surfaceVel ? vecSub(c.vel, surfaceVel) : c.vel;
  const vn = vecDot(relVel, n);
  if (vn < 0) {
    c.vel = vecSub(c.vel, vecMul(n, (1 + restitution) * vn));
    if (surfaceVel) {
      c.vel = vecAdd(c.vel, vecMul(surfaceVel, 0.35));
    }
  }
  return true;
};

export const resolveCircleCircle = (
  a: Circle,
  b: Circle,
  restitution = 0.8
): void => {
  const diff = vecSub(b.pos, a.pos);
  const d = vecLen(diff);
  if (d === 0 || d >= a.r + b.r) {
    return;
  }

  const n = vecMul(diff, 1 / d);
  const penetration = a.r + b.r - d;
  const totalInv = a.invM + b.invM;
  a.pos = vecAdd(a.pos, vecMul(n, -penetration * (a.invM / totalInv)));
  b.pos = vecAdd(b.pos, vecMul(n, penetration * (b.invM / totalInv)));

  const rel = vecSub(b.vel, a.vel);
  const vn = vecDot(rel, n);
  if (vn > 0) {
    return;
  }

  const j = (-(1 + restitution) * vn) / totalInv;
  const impulse = vecMul(n, j);
  circleApplyImpulse(a, vecMul(impulse, -1));
  circleApplyImpulse(b, impulse);
};
