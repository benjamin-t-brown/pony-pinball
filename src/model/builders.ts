import { lineCreate } from '../sim/physics';
import {
  LAUNCHER_FORCE,
  LAUNCHER_RANGE,
  LEFT_REST_ANGLE,
  LEFT_UP,
} from './constants';
import type { SectionData } from './levels';
import { CONTROL_LEFT, CONTROL_RIGHT, CONTROL_START } from './Part';
import { Launcher } from './parts/Launcher';
import { makeCircle } from './parts/Obstacle';
import { Paddle } from './parts/Paddle';
import { type Section, sectionCreate } from './Section';

export const START = 0;

export const BG = ['#555', '#466', '#645'];

export const B_WALLS = 0;
export const B_LAUNCHER = 2;
// export const B_BUMPER = 3;
// export const B_FIELD = 4;
export const B_FLIPPER_LEFT = 5;
export const B_CIRCLE = 6;

export const SECTION_SIDE_BOTTOM = 0;
export const SECTION_SIDE_TOP = 1;
export const SECTION_SIDE_LEFT = 2;
export const SECTION_SIDE_RIGHT = 3;

/**
 * Builders turn a handful of numbers into geometry. Each may push walls, parts
 * or both — a flipper pair owns its inlane slopes as much as its paddles — and
 * they expand at runtime so the data stays small and stays retunable in one
 * place.
 */
export const BUILDERS: ((s: Section, d: number[]) => void)[] = [];

BUILDERS[B_WALLS] = (section, wallList) => {
  for (let i = 0; i < wallList.length; i += 4) {
    section.walls.push(
      lineCreate(wallList[i], wallList[i + 1], wallList[i + 2], wallList[i + 3])
    );
  }
};

BUILDERS[B_FLIPPER_LEFT] = (section, [x, y, restAngle, upAngle, isFlipped]) => {
  const rest = restAngle || LEFT_REST_ANGLE;
  const up = upAngle || LEFT_UP;
  section.parts.push(
    new Paddle(
      x,
      y,
      isFlipped ? CONTROL_RIGHT : CONTROL_LEFT,
      isFlipped ? Math.PI - rest : rest,
      isFlipped ? Math.PI - up : up
    )
  );
};

BUILDERS[B_LAUNCHER] = (s, [x, y, dx, dy, force, range]) => {
  s.parts.push(
    new Launcher(
      x,
      y,
      CONTROL_START,
      dx || 0,
      dy || -1,
      force || LAUNCHER_FORCE,
      range || LAUNCHER_RANGE
    )
  );
};

BUILDERS[B_CIRCLE] = (
  section,
  [x, y, resolution, restitution, radius, dx, dy, omega]
) => {
  const circle = makeCircle(
    x,
    y,
    resolution,
    restitution,
    radius,
    dx || 0,
    dy || 0,
    omega || 0
  );
  section.parts.push(circle);
};

// assumes an edge can only have one hole in it at max
const buildSectionEdges = (sections: Section[], links: number[][]) => {
  const walls = BUILDERS[B_WALLS];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const { w, h } = s;
    // bottom, top, left, right — index matches SECTION_SIDE_*
    const edges = [
      [0, h, w, h],
      [0, 0, w, 0],
      [0, 0, 0, h],
      [w, 0, w, h],
    ];
    for (let e = 0; e < 4; e++) {
      const [x0, y0, x1, y1] = edges[e];
      let o = 0;
      let g = 0;
      for (let k = 0; k < links.length; k++) {
        const l = links[k];
        if (l[0] === i && l[1] === e) {
          o = l[2];
          g = o + l[3];
          break;
        }
      }
      if (g) {
        walls(
          s,
          y0 === y1
            ? [x0, y0, o, y0, g, y0, x1, y0]
            : [x0, y0, x0, o, x0, g, x0, y1]
        );
      } else {
        walls(s, [x0, y0, x1, y1]);
      }
    }
  }
};

export const buildLevel = (
  sectionData: SectionData[],
  links: number[][]
): Section[] => {
  const sections = sectionData.map((d, i) =>
    sectionCreate(i, d[0], d[1], d[2], d[3], BG[d[4]])
  );
  buildSectionEdges(sections, links);
  for (let i = 0; i < sectionData.length; i++) {
    const calls = sectionData[i][5];
    for (let j = 0; j < calls.length; j++) {
      BUILDERS[calls[j][0]](sections[i], calls[j].slice(1));
    }
  }
  return sections;
};
