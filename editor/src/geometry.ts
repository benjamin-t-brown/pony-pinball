import {
  SECTION_SIDE_BOTTOM,
  SECTION_SIDE_LEFT,
  SECTION_SIDE_RIGHT,
  SECTION_SIDE_TOP,
} from '@game/model/builders';
import type { SectionData } from './types';

export const SNAP_PX = 8;
export const MIN_SECTION = 40;

export type EdgeWorld = {
  axis: 'h' | 'v';
  pos: number;
  lo: number;
  hi: number;
};

export const cloneSections = (sections: SectionData[]): SectionData[] => {
  return sections.map(d => [
    d[0],
    d[1],
    d[2],
    d[3],
    d[4],
    d[5].map(c => c.slice()),
  ]);
};

export const oppositeSide = (side: number) => {
  return side ^ 1;
};

export const edgeWorld = (s: SectionData, side: number): EdgeWorld => {
  const x = s[0];
  const y = s[1];
  const w = s[2];
  const h = s[3];
  if (side === SECTION_SIDE_TOP) {
    return { axis: 'h', pos: y, lo: x, hi: x + w };
  }
  if (side === SECTION_SIDE_BOTTOM) {
    return { axis: 'h', pos: y + h, lo: x, hi: x + w };
  }
  if (side === SECTION_SIDE_LEFT) {
    return { axis: 'v', pos: x, lo: y, hi: y + h };
  }
  return { axis: 'v', pos: x + w, lo: y, hi: y + h };
};

export const sharedBoundary = (a: SectionData, b: SectionData) => {
  for (let aSide = 0; aSide < 4; aSide++) {
    const bSide = oppositeSide(aSide);
    const ea = edgeWorld(a, aSide);
    const eb = edgeWorld(b, bSide);
    if (ea.axis !== eb.axis) {
      continue;
    }
    if (Math.abs(ea.pos - eb.pos) > 0.01) {
      continue;
    }
    const lo = Math.max(ea.lo, eb.lo);
    const hi = Math.min(ea.hi, eb.hi);
    if (hi > lo + 0.01) {
      return { aSide, bSide, lo, hi, pos: ea.pos, axis: ea.axis };
    }
  }
  return null;
};

export const findSectionAt = (sections: SectionData[], x: number, y: number) => {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (x >= s[0] && x <= s[0] + s[2] && y >= s[1] && y <= s[1] + s[3]) {
      return i;
    }
  }
  return -1;
};

export const px = (n: number) => {
  return Math.round(n);
};

/** 15° steps: 0, 15, 30, 45, 60, 75, 90, … */
export const ANGLE_SNAP = Math.PI / 12;

export const snapPolar = (x0: number, y0: number, x1: number, y1: number) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) {
    return { x: x1, y: y1 };
  }
  const ang = Math.round(Math.atan2(dy, dx) / ANGLE_SNAP) * ANGLE_SNAP;
  return {
    x: x0 + Math.cos(ang) * len,
    y: y0 + Math.sin(ang) * len,
  };
};

export const toLocal = (section: SectionData, wx: number, wy: number) => {
  return { x: wx - section[0], y: wy - section[1] };
};

export const clampLocal = (section: SectionData, x: number, y: number) => {
  return {
    x: px(Math.max(0, Math.min(section[2], x))),
    y: px(Math.max(0, Math.min(section[3], y))),
  };
};

export const clampDeltaInRect = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  dx: number,
  dy: number,
  w: number,
  h: number
) => {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  return {
    dx: Math.max(-minX, Math.min(w - maxX, dx)),
    dy: Math.max(-minY, Math.min(h - maxY, dy)),
  };
};

export const distToSegment = (
  px: number,
  py: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  let t = 0;
  if (len2 > 1e-8) {
    t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len2));
  }
  const qx = x0 + dx * t;
  const qy = y0 + dy * t;
  return Math.hypot(px - qx, py - qy);
};

export type LiveEdges = {
  l: boolean;
  r: boolean;
  t: boolean;
  b: boolean;
};

const nearestDelta = (value: number, list: number[], dist: number) => {
  let best = 0;
  let bestAbs = dist;
  for (let i = 0; i < list.length; i++) {
    const d = list[i] - value;
    const a = Math.abs(d);
    if (a < bestAbs) {
      bestAbs = a;
      best = d;
    }
  }
  return bestAbs < dist ? best : 0;
};

export const snapRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  others: SectionData[],
  live: LiveEdges,
  dist: number
) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < others.length; i++) {
    const o = others[i];
    xs.push(o[0], o[0] + o[2]);
    ys.push(o[1], o[1] + o[3]);
  }

  let nx = x;
  let ny = y;
  let nw = w;
  let nh = h;

  if (live.l && live.r) {
    const dl = nearestDelta(x, xs, dist);
    const dr = nearestDelta(x + w, xs, dist);
    let dx = 0;
    if (dl !== 0 && (dr === 0 || Math.abs(dl) <= Math.abs(dr))) {
      dx = dl;
    } else if (dr !== 0) {
      dx = dr;
    }
    nx = x + dx;
  } else if (live.l) {
    const d = nearestDelta(x, xs, dist);
    nx = x + d;
    nw = w - d;
  } else if (live.r) {
    nw = w + nearestDelta(x + w, xs, dist);
  }

  if (live.t && live.b) {
    const dt = nearestDelta(y, ys, dist);
    const db = nearestDelta(y + h, ys, dist);
    let dy = 0;
    if (dt !== 0 && (db === 0 || Math.abs(dt) <= Math.abs(db))) {
      dy = dt;
    } else if (db !== 0) {
      dy = db;
    }
    ny = y + dy;
  } else if (live.t) {
    const d = nearestDelta(y, ys, dist);
    ny = y + d;
    nh = h - d;
  } else if (live.b) {
    nh = h + nearestDelta(y + h, ys, dist);
  }

  if (nw < MIN_SECTION) {
    if (live.l && !live.r) {
      nx = x + w - MIN_SECTION;
    }
    nw = MIN_SECTION;
  }
  if (nh < MIN_SECTION) {
    if (live.t && !live.b) {
      ny = y + h - MIN_SECTION;
    }
    nh = MIN_SECTION;
  }
  return { x: px(nx), y: px(ny), w: px(nw), h: px(nh) };
};

export const normalizeRect = (x0: number, y0: number, x1: number, y1: number) => {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  return {
    x,
    y,
    w: Math.max(MIN_SECTION, Math.abs(x1 - x0)),
    h: Math.max(MIN_SECTION, Math.abs(y1 - y0)),
  };
};

export const findSharedEdgeAt = (
  sections: SectionData[],
  wx: number,
  wy: number,
  slop: number
) => {
  let bestDist = slop;
  let best: {
    a: number;
    b: number;
    aSide: number;
    bSide: number;
    lo: number;
    hi: number;
    pos: number;
    axis: 'h' | 'v';
  } | null = null;
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const share = sharedBoundary(sections[i], sections[j]);
      if (!share) {
        continue;
      }
      const along = share.axis === 'h' ? wx : wy;
      const dist = share.axis === 'h' ? Math.abs(wy - share.pos) : Math.abs(wx - share.pos);
      if (along < share.lo - slop || along > share.hi + slop) {
        continue;
      }
      if (dist < bestDist) {
        bestDist = dist;
        best = { a: i, b: j, ...share };
      }
    }
  }
  return best;
};

export const rectsOverlap = (a: SectionData, b: SectionData) => {
  return (
    a[0] < b[0] + b[2] &&
    a[0] + a[2] > b[0] &&
    a[1] < b[1] + b[3] &&
    a[1] + a[3] > b[1]
  );
};

export type Handle = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export const HANDLE_LIVE: Record<Handle, LiveEdges> = {
  n: { l: false, r: false, t: true, b: false },
  s: { l: false, r: false, t: false, b: true },
  e: { l: false, r: true, t: false, b: false },
  w: { l: true, r: false, t: false, b: false },
  nw: { l: true, r: false, t: true, b: false },
  ne: { l: false, r: true, t: true, b: false },
  sw: { l: true, r: false, t: false, b: true },
  se: { l: false, r: true, t: false, b: true },
};

export const applyHandle = (
  orig: SectionData,
  handle: Handle,
  wx: number,
  wy: number
) => {
  let x = orig[0];
  let y = orig[1];
  let w = orig[2];
  let h = orig[3];
  const right = x + w;
  const bottom = y + h;
  if (handle.includes('w')) {
    x = wx;
    w = right - x;
  }
  if (handle.includes('e')) {
    w = wx - x;
  }
  if (handle.includes('n')) {
    y = wy;
    h = bottom - y;
  }
  if (handle.includes('s')) {
    h = wy - y;
  }
  if (w < 0) {
    x = x + w;
    w = -w;
  }
  if (h < 0) {
    y = y + h;
    h = -h;
  }
  return { x, y, w, h };
};

export const handlePositions = (s: SectionData) => {
  const x = s[0];
  const y = s[1];
  const w = s[2];
  const h = s[3];
  const mx = x + w / 2;
  const my = y + h / 2;
  return [
    { id: 'nw' as Handle, x, y },
    { id: 'n' as Handle, x: mx, y },
    { id: 'ne' as Handle, x: x + w, y },
    { id: 'e' as Handle, x: x + w, y: my },
    { id: 'se' as Handle, x: x + w, y: y + h },
    { id: 's' as Handle, x: mx, y: y + h },
    { id: 'sw' as Handle, x, y: y + h },
    { id: 'w' as Handle, x, y: my },
  ];
};
