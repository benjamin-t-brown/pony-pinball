import { Line, lineCreate, lineSet } from '../sim/physics';
import type { Part } from './Part';

/** Perimeter edge bits, in the order applyPerimeter walks them. */
export const EDGE_TOP = 1;
export const EDGE_RIGHT = 2;
export const EDGE_BOTTOM = 4;
export const EDGE_LEFT = 8;
export const EDGE_ALL = 15;

export type Section = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  walls: Line[];
  parts: Part[];
  bg: string;
};

export const sectionCreate = (
  id: number,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string,
): Section => ({
  id,
  x,
  y,
  w,
  h,
  walls: [],
  parts: [],
  bg,
});

export const sectionContains = (section: Section, x: number, y: number) => {
  return (
    x >= section.x &&
    x <= section.x + section.w &&
    y >= section.y &&
    y <= section.y + section.h
  );
};

export const findSectionAt = (
  sections: Section[],
  x: number,
  y: number,
  current: Section | null
) => {
  if (current && sectionContains(current, x, y)) {
    return current;
  }
  for (let i = 0; i < sections.length; i++) {
    if (sectionContains(sections[i], x, y)) {
      return sections[i];
    }
  }
  return current;
};

export const isPointInAnySection = (
  sections: Section[],
  x: number,
  y: number,
  margin: number
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (
      x >= s.x - margin &&
      x <= s.x + s.w + margin &&
      y >= s.y - margin &&
      y <= s.y + s.h + margin
    ) {
      return true;
    }
  }
  return false;
};

export const forEachPart = (
  sections: Section[],
  fn: (part: Part, section: Section) => void
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.parts.length; j++) {
      fn(s.parts[j], s);
    }
  }
};

/**
 * Generates each section's perimeter walls from its rect, its `edges` mask and
 * the level's links, and appends them to section.walls.
 *
 * Two kinds of span are skipped, and they work the same way:
 *  - a link's opening, so the ball can pass between sections;
 *  - a boundary shared with a LOWER-index section, which owns that wall. Both
 *    sides emitting would leave coincident duplicates, doubling the work in
 *    resolveBallWalls for no behavioural difference.
 *
 * A link's `offset` is a world coordinate along the boundary's varying axis, so
 * neither section's origin is privileged.
 */
// export const applyPerimeter = (sections: Section[], links: number[][]) => {
//   // skip[section * 4 + edgeIndex] = spans of [lo, hi] in local edge coords,
//   // edgeIndex being 0 top, 1 right, 2 bottom, 3 left.
//   const skip: number[][][] = [];
//   for (let i = 0; i < sections.length * 4; i++) {
//     skip.push([]);
//   }
//   const add = (si: number, edge: number, lo: number, len: number) => {
//     skip[si * 4 + edge].push([lo, lo + len]);
//   };

//   for (let i = 0; i < links.length; i++) {
//     const [ai, bi, off, wide] = links[i];
//     const a = sections[ai];
//     const b = sections[bi];
//     if (a.y + a.h === b.y) {
//       add(ai, 2, off - a.x, wide);
//       add(bi, 0, off - b.x, wide);
//     } else if (b.y + b.h === a.y) {
//       add(ai, 0, off - a.x, wide);
//       add(bi, 2, off - b.x, wide);
//     } else if (a.x + a.w === b.x) {
//       add(ai, 1, off - a.y, wide);
//       add(bi, 3, off - b.y, wide);
//     } else if (b.x + b.w === a.x) {
//       add(ai, 3, off - a.y, wide);
//       add(bi, 1, off - b.y, wide);
//     }
//   }

//   // Shared-boundary ownership. j < i, so j is the owner and i gives up the span.
//   for (let i = 0; i < sections.length; i++) {
//     for (let j = 0; j < i; j++) {
//       const a = sections[i];
//       const b = sections[j];
//       const vertical = a.x + a.w === b.x || b.x + b.w === a.x;
//       const lo = vertical
//         ? Math.max(a.y, b.y)
//         : Math.max(a.x, b.x);
//       const hi = vertical
//         ? Math.min(a.y + a.h, b.y + b.h)
//         : Math.min(a.x + a.w, b.x + b.w);
//       if (lo >= hi) {
//         continue;
//       }
//       if (a.y + a.h === b.y) {
//         add(i, 2, lo - a.x, hi - lo);
//       } else if (b.y + b.h === a.y) {
//         add(i, 0, lo - a.x, hi - lo);
//       } else if (a.x + a.w === b.x) {
//         add(i, 1, lo - a.y, hi - lo);
//       } else if (b.x + b.w === a.x) {
//         add(i, 3, lo - a.y, hi - lo);
//       }
//     }
//   }

//   for (let i = 0; i < sections.length; i++) {
//     const s = sections[i];
//     for (let edge = 0; edge < 4; edge++) {
//       if (!(s.edges & (1 << edge))) {
//         continue;
//       }
//       const spans = skip[i * 4 + edge];
//       spans.sort((p, q) => p[0] - q[0]);
//       const len = edge & 1 ? s.h : s.w;
//       let cursor = 0;
//       for (let k = 0; k <= spans.length; k++) {
//         const stop = k < spans.length ? spans[k][0] : len;
//         if (stop > cursor) {
//           // Walk the edge as a run from `cursor` to `stop` along its axis.
//           s.walls.push(
//             edge === 0
//               ? lineCreate(cursor, 0, stop, 0)
//               : edge === 1
//                 ? lineCreate(s.w, cursor, s.w, stop)
//                 : edge === 2
//                   ? lineCreate(cursor, s.h, stop, s.h)
//                   : lineCreate(0, cursor, 0, stop)
//           );
//         }
//         if (k < spans.length && spans[k][1] > cursor) {
//           cursor = spans[k][1];
//         }
//       }
//     }
//   }
// };

export const flattenSectionWalls = (
  sections: Section[],
  into?: Line[]
): Line[] => {
  const walls = into || [];
  let n = 0;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.walls.length; j++) {
      const wall = s.walls[j];
      if (wall.rest < 0) {
        continue;
      }
      const x0 = wall.a.x + s.x;
      const y0 = wall.a.y + s.y;
      const x1 = wall.b.x + s.x;
      const y1 = wall.b.y + s.y;
      if (n < walls.length) {
        lineSet(walls[n], x0, y0, x1, y1);
        walls[n].rest = wall.rest;
        walls[n].color = wall.color;
      } else {
        walls.push(lineCreate(x0, y0, x1, y1, wall.rest, wall.color));
      }
      n++;
    }
  }
  walls.length = n;
  return walls;
};
