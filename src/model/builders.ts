import { lineCreate } from '../sim/physics';
import { CONTROL_LEFT, CONTROL_RIGHT, CONTROL_START } from './Part';
import { GATE_COLORS, LEFT_REST_ANGLE, LEFT_UP, PADDLE_LEN } from './constants';
import { Collectable } from './parts/Collectable';
import { Decoration } from './parts/Decoration';
import { Field } from './parts/Field';
import { Launcher } from './parts/Launcher';
import { makeCircle, makeFan } from './parts/Obstacle';
import { Paddle } from './parts/Paddle';
import { Portal } from './parts/Portal';
import { type Section, sectionCreate } from './Section';
import { TRIGGERS, Trigger } from './Trigger';
import { SOUND_HIT_FAN } from '../zzfx.js';

export { GATE_COLORS };

type SectionData = [number, number, number, number, number[][]];

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
export const B_TRIANGLE = 11;
export const B_DECORATION = 12;

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
  const rest = restAngle == null ? LEFT_REST_ANGLE : restAngle;
  const up = upAngle == null ? LEFT_UP : upAngle;
  section.parts.push(
    new Paddle(
      x,
      y,
      isFlipped ? CONTROL_RIGHT : CONTROL_LEFT,
      isFlipped ? Math.PI - rest : rest,
      isFlipped ? Math.PI - up : up,
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
  [x, y, resolution, restitution, radius, dx, dy, omega, icon, color]
) => {
  section.parts.push(
    makeCircle(x, y, resolution, restitution, radius, dx, dy, omega, icon, color)
  );
};

BUILDERS[B_FAN] = (
  section,
  [x, y, paddles, restitution, radius, omega, dx, dy]
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

/**
 * Right triangle at (x, y): side1 along `rot`, side2 along rot+90°.
 * Walls are pushed as hypot (resti0), side1 (resti1), side2 (resti2).
 */
export const triangleVerts = (
  x: number,
  y: number,
  len1: number,
  len2: number,
  rot: number
) => {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return {
    x0: x,
    y0: y,
    x1: x + len1 * c,
    y1: y + len1 * s,
    x2: x - len2 * s,
    y2: y + len2 * c,
  };
};

BUILDERS[B_TRIANGLE] = (
  s,
  [x, y, sideLen1, sideLen2, rot, resti0, resti1, resti2, color]
) => {
  const v = triangleVerts(x, y, sideLen1, sideLen2, rot);
  const c = color == null ? 0 : color | 0;
  s.fills.push([
    v.x0,
    v.y0,
    v.x1,
    v.y1,
    v.x2,
    v.y2,
    c < 0 ? 0 : c % GATE_COLORS.length,
  ]);
  s.walls.push(
    lineCreate(v.x1, v.y1, v.x2, v.y2, resti0, -1, SOUND_HIT_FAN)
  );
  s.walls.push(lineCreate(v.x0, v.y0, v.x1, v.y1, resti1));
  s.walls.push(lineCreate(v.x0, v.y0, v.x2, v.y2, resti2));
};

BUILDERS[B_DECORATION] = (s, data) => {
  s.parts.push(
    new Decoration(
      data[0],
      data[1],
      data[2],
      data[3],
      data[4],
      data[5],
      data.slice(6)
    )
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
    sectionCreate(i, d[0], d[1], d[2], d[3])
  );
  buildSectionEdges(sections, links);
  for (let i = 0; i < sectionData.length; i++) {
    const calls = sectionData[i][4];
    for (let j = 0; j < calls.length; j++) {
      BUILDERS[calls[j][0]](sections[i], calls[j].slice(1));
    }
  }
  return sections;
};
