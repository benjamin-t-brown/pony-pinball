import { lineCreate } from '../sim/physics';
import type { SectionData } from '../levels';
import { CONTROL_LEFT, CONTROL_RIGHT, CONTROL_START } from './Part';
import { PADDLE_LEN } from './constants';
import { Collectable } from './parts/Collectable';
import { Field } from './parts/Field';
import { Launcher } from './parts/Launcher';
import { makeCircle, makeFan } from './parts/Obstacle';
import { Paddle } from './parts/Paddle';
import { Portal } from './parts/Portal';
import { type Section, sectionCreate } from './Section';
import { TRIGGERS, Trigger } from './Trigger';

export const BG = ['#555', '#466', '#645'];
/** Gate wall stroke colors; builder `color` indexes this list. */
export const GATE_COLORS = ['#fc8', '#8cf', '#f66', '#6c6', '#c8f', '#fa6'];

export const B_WALLS = 0;
export const B_WALL_RESTI = 1;
export const B_LAUNCHER = 2;
export const B_WALL_GATE = 3;
export const B_FIELD = 4;
export const B_FLIPPER_LEFT = 5;
export const B_CIRCLE = 6;
export const B_CONVEYER = 7;
export const B_COLLECTABLE = 8;
export const B_FAN = 9;
export const B_PORTAL = 10;

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

BUILDERS[B_WALL_RESTI] = (section, [x0, y0, x1, y1, rest]) => {
  section.walls.push(lineCreate(x0, y0, x1, y1, rest));
};

BUILDERS[B_WALL_GATE] = (section, [x0, y0, x1, y1, color]) => {
  const c = color | 0;
  section.walls.push(
    lineCreate(x0, y0, x1, y1, 0.5, c < 0 ? 0 : c % GATE_COLORS.length)
  );
};

BUILDERS[B_FLIPPER_LEFT] = (
  section,
  [x, y, restAngle, upAngle, isFlipped, flipperLength]
) => {
  section.parts.push(
    new Paddle(
      x,
      y,
      isFlipped ? CONTROL_RIGHT : CONTROL_LEFT,
      isFlipped ? Math.PI - restAngle : restAngle,
      isFlipped ? Math.PI - upAngle : upAngle,
      flipperLength > 0 ? flipperLength : PADDLE_LEN
    )
  );
};

BUILDERS[B_LAUNCHER] = (s, [x, y, dx, dy, force, range, chargeMs, launcherLength]) => {
  s.parts.push(
    new Launcher(
      x,
      y,
      CONTROL_START,
      dx,
      dy,
      force,
      range,
      chargeMs,
      launcherLength
    )
  );
};

BUILDERS[B_FIELD] = (s, data) => {
  const x = data[0];
  const y = data[1];
  const w = data[2];
  const h = data[3];
  const id = data[4];
  const Ctor = TRIGGERS[id] || Trigger;
  const field = new Field(x, y, w, h);
  field.trigger = new Ctor(data.slice(5));
  s.parts.push(field);
};

BUILDERS[B_CONVEYER] = (s, [x, y, w, h, angle, power, maxSpeed, drag]) => {
  const field = new Field(
    x,
    y,
    w,
    h,
    0,
    Math.cos(angle) * power,
    Math.sin(angle) * power,
    maxSpeed
  );
  field.drag = drag;
  s.parts.push(field);
};

BUILDERS[B_CIRCLE] = (
  section,
  [x, y, resolution, restitution, radius, dx, dy, omega]
) => {
  section.parts.push(
    makeCircle(x, y, resolution, restitution, radius, dx, dy, omega)
  );
};

BUILDERS[B_FAN] = (
  section,
  [x, y, paddles, restitution, radius, dx, dy, omega]
) => {
  section.parts.push(
    makeFan(x, y, paddles, restitution, radius, dx, dy, omega)
  );
};

BUILDERS[B_COLLECTABLE] = (s, [x, y, r, groupType, id]) => {
  const Ctor = TRIGGERS[id] || Trigger;
  const coin = new Collectable(x, y, r, groupType);
  coin.trigger = new Ctor([]);
  s.parts.push(coin);
};

BUILDERS[B_PORTAL] = (s, [x0, y0, x1, y1, r, color]) => {
  const c = color | 0;
  s.parts.push(
    new Portal(x0, y0, x1, y1, r, c < 0 ? 0 : c % GATE_COLORS.length)
  );
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
