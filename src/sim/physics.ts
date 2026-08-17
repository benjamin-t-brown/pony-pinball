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
  rest: number;
};

// Extra distance the solver pushes a body past the surface, so the next step
// starts outside instead of exactly on the boundary.
export const CONTACT_SLOP = 0.01;

// A surface that is moving toward the body has to be outrun, or it overtakes
// the body again on the next substep and applies a second impulse. This is the
// minimum speed a body leaves such a surface with, relative to the surface.
export const MIN_SEPARATION_SPEED = 30;

export const vecCreate = (x = 0, y = 0): Vec => ({ x, y });

export const vecAdd = (a: Vec, b: Vec): Vec => vecCreate(a.x + b.x, a.y + b.y);
export const vecSub = (a: Vec, b: Vec): Vec => vecCreate(a.x - b.x, a.y - b.y);
export const vecMul = (v: Vec, s: number): Vec => vecCreate(v.x * s, v.y * s);
export const vecDot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;
export const vecLen = (v: Vec): number => Math.hypot(v.x, v.y);
export const vecNorm = (v: Vec): Vec => vecMul(v, 1 / (vecLen(v) || 1));
export const vecPerp = (v: Vec): Vec => vecCreate(-v.y, v.x);

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

export const GRAVITY = 1200;

export const circleIntegrate = (
  c: Circle,
  dtSeconds: number,
  gravity = GRAVITY
): Circle => {
  c.vel = vecAdd(c.vel, vecMul(vecCreate(0, gravity), dtSeconds));
  c.pos = vecAdd(c.pos, vecMul(c.vel, dtSeconds));
  return c;
};

export const lineCreate = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rest = 0.5
): Line => ({
  a: vecCreate(x1, y1),
  b: vecCreate(x2, y2),
  rest,
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

// The closest point on the segment, plus the clamped parameter that produced
// it. t of exactly 0 or 1 means the closest point is an endpoint cap, which
// needs a radial normal rather than the segment's perpendicular.
export const lineClosestPointT = (l: Line, p: Vec): { point: Vec; t: number } => {
  const ab = vecSub(l.b, l.a);
  const abLen2 = vecDot(ab, ab) || 1;
  let t = vecDot(vecSub(p, l.a), ab) / abLen2;
  t = Math.max(0, Math.min(1, t));
  return { point: vecAdd(l.a, vecMul(ab, t)), t };
};

export const lineClosestPoint = (l: Line, p: Vec): Vec =>
  lineClosestPointT(l, p).point;

/**
 * Resolves one contact between a circle and a surface of infinite mass.
 *
 * `n` is a unit normal pointing from the surface toward the circle and `depth`
 * is how far the circle has to travel along it to be clear. `surfaceVel` is the
 * velocity of the surface at the contact point, or null for a static surface.
 *
 * All of the velocity work happens in the surface's frame of reference. That is
 * what makes a moving surface behave: the bounce is computed against the
 * relative velocity, then the surface velocity is added back once. Adding any
 * fraction of the surface velocity on top of an already-resolved bounce injects
 * energy on every substep of a sustained contact, which is what made the paddle
 * drag the ball around instead of striking it.
 */
export const resolveCircleSurface = (
  c: Circle,
  n: Vec,
  depth: number,
  rest: number,
  friction: number,
  surfaceVel: Vec | null
): boolean => {
  if (depth <= 0) {
    return false;
  }
  c.pos = vecAdd(c.pos, vecMul(n, depth + CONTACT_SLOP));

  const rel = surfaceVel ? vecSub(c.vel, surfaceVel) : c.vel;
  const vn = vecDot(rel, n);
  if (vn >= 0) {
    // Already separating in the surface's frame: this is a resting or trailing
    // contact, so correcting the position is the whole job.
    return true;
  }

  const relT = vecSub(rel, vecMul(n, vn));
  let outN = -vn * rest;
  if (surfaceVel && vecDot(surfaceVel, n) > 0 && outN < MIN_SEPARATION_SPEED) {
    outN = MIN_SEPARATION_SPEED;
  }

  // Coulomb friction: the normal impulse can cancel at most `friction` times as
  // much tangential slip.
  let outT = relT;
  const vt = vecLen(relT);
  if (friction > 0 && vt > 1e-6) {
    const maxDrop = friction * (1 + rest) * -vn;
    outT = vecMul(relT, Math.max(0, vt - maxDrop) / vt);
  }

  const newRel = vecAdd(vecMul(n, outN), outT);
  c.vel = surfaceVel ? vecAdd(newRel, surfaceVel) : newRel;
  return true;
};

export const resolveCircleLine = (
  c: Circle,
  l: Line,
  friction = 0,
  surfaceVel: Vec | null = null
): boolean => {
  const cp = lineClosestPoint(l, c.pos);
  const diff = vecSub(c.pos, cp);
  const dist = vecLen(diff);
  if (dist >= c.r) {
    return false;
  }

  // A centre sitting exactly on the segment has no direction to push along, so
  // fall back to the segment's own perpendicular instead of skipping the hit.
  const n =
    dist > 1e-6 ? vecMul(diff, 1 / dist) : vecNorm(vecPerp(vecSub(l.b, l.a)));
  return resolveCircleSurface(
    c,
    n,
    c.r - dist,
    l.rest,
    friction,
    surfaceVel
  );
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
