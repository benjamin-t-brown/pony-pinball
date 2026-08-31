import { SECTION_SIDE_BOTTOM, SECTION_SIDE_TOP } from '@game/model/builders';
import { edgeWorld, oppositeSide, px, sharedBoundary } from './geometry';
import type { Opening, SectionData } from './types';

export const localToWorldOffset = (
  section: SectionData,
  side: number,
  local: number
) => {
  if (side === SECTION_SIDE_TOP || side === SECTION_SIDE_BOTTOM) {
    return section[0] + local;
  }
  return section[1] + local;
};

export const worldToLocalOffset = (
  section: SectionData,
  side: number,
  world: number
) => {
  if (side === SECTION_SIDE_TOP || side === SECTION_SIDE_BOTTOM) {
    return world - section[0];
  }
  return world - section[1];
};

export const linksToOpenings = (
  sections: SectionData[],
  links: number[][]
): Opening[] => {
  const used = new Set<number>();
  const openings: Opening[] = [];
  for (let i = 0; i < links.length; i++) {
    if (used.has(i)) {
      continue;
    }
    const si = links[i][0];
    const side = links[i][1];
    const local = links[i][2];
    const width = links[i][3];
    const section = sections[si];
    if (!section) {
      continue;
    }
    const world = localToWorldOffset(section, side, local);
    let paired = -1;
    for (let j = i + 1; j < links.length; j++) {
      if (used.has(j)) {
        continue;
      }
      const sj = links[j][0];
      const sideJ = links[j][1];
      const widthJ = links[j][3];
      const other = sections[sj];
      if (!other || widthJ !== width) {
        continue;
      }
      if (sideJ !== oppositeSide(side)) {
        continue;
      }
      const worldJ = localToWorldOffset(other, sideJ, links[j][2]);
      if (Math.abs(worldJ - world) > 0.01) {
        continue;
      }
      const share = sharedBoundary(section, other);
      if (!share) {
        continue;
      }
      if (share.aSide !== side) {
        continue;
      }
      paired = j;
      break;
    }
    if (paired >= 0) {
      used.add(paired);
      openings.push({
        a: si,
        aSide: side,
        b: links[paired][0],
        bSide: links[paired][1],
        offset: world,
        width,
      });
    } else {
      openings.push({
        a: si,
        aSide: side,
        b: -1,
        bSide: -1,
        offset: world,
        width,
      });
    }
  }
  return openings;
};

export const openingsToLinks = (
  sections: SectionData[],
  openings: Opening[]
): number[][] => {
  const links: number[][] = [];
  for (let i = 0; i < openings.length; i++) {
    const o = openings[i];
    const a = sections[o.a];
    if (!a) {
      continue;
    }
    links.push([o.a, o.aSide, worldToLocalOffset(a, o.aSide, o.offset), o.width]);
    if (o.b >= 0) {
      const b = sections[o.b];
      if (b) {
        links.push([
          o.b,
          o.bSide,
          worldToLocalOffset(b, o.bSide, o.offset),
          o.width,
        ]);
      }
    }
  }
  return links;
};

export const clampOpening = (o: Opening, sections: SectionData[]): Opening => {
  const a = sections[o.a];
  if (!a) {
    return o;
  }
  let lo = 0;
  let hi = 0;
  if (o.b >= 0) {
    const b = sections[o.b];
    const share = b ? sharedBoundary(a, b) : null;
    if (share) {
      lo = share.lo;
      hi = share.hi;
    } else {
      const e = edgeWorld(a, o.aSide);
      lo = e.lo;
      hi = e.hi;
    }
  } else {
    const e = edgeWorld(a, o.aSide);
    lo = e.lo;
    hi = e.hi;
  }
  const maxW = Math.max(1, hi - lo);
  const width = px(Math.min(o.width, maxW));
  const offset = px(Math.max(lo, Math.min(o.offset, hi - width)));
  return { ...o, offset, width };
};

export const openingSpan = (o: Opening, sections: SectionData[]) => {
  const a = sections[o.a];
  if (!a) {
    return null;
  }
  const e = edgeWorld(a, o.aSide);
  return {
    axis: e.axis,
    pos: e.pos,
    lo: o.offset,
    hi: o.offset + o.width,
  };
};

export const remapOpeningsAfterDelete = (
  openings: Opening[],
  deleted: number
): Opening[] => {
  const next: Opening[] = [];
  for (let i = 0; i < openings.length; i++) {
    const o = openings[i];
    if (o.a === deleted || o.b === deleted) {
      continue;
    }
    next.push({
      ...o,
      a: o.a > deleted ? o.a - 1 : o.a,
      b: o.b > deleted ? o.b - 1 : o.b,
    });
  }
  return next;
};

export const DEFAULT_OPENING_WIDTH = 100;
