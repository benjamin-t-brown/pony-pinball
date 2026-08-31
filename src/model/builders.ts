import { lineCreate } from '../sim/PhysicsFuncs';
import { CONTROL_LEFT, CONTROL_RIGHT, CONTROL_START, type Part } from './Part';
import { LEFT_REST_ANGLE, LEFT_UP, PADDLE_LEN } from './Constants';
import { palette } from '../machine/MachineLook';
import { Collectable } from './parts/Collectable';
import { Decoration } from './parts/Decoration';
import { Field } from './parts/Field';
import { Launcher } from './parts/Launcher';
import { makeCircle, makeFan } from './parts/Obstacle';
import { Paddle } from './parts/Paddle';
import { Portal } from './parts/Portal';
import { type Section, sectionCreate } from './SectionFuncs';
import { TRIGGERS, Trigger } from './Trigger';
import { SOUND_HIT_FAN } from '../Zzfx.js';
import {
  B_CIRCLE,
  B_COLLECTABLE,
  B_CONVEYER,
  B_DECORATION,
  B_FAN,
  B_FIELD,
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_PORTAL,
  B_TRIANGLE,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_PLAY_SOUND,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
  decorationStyleId,
  fieldTriggerId,
  num,
  partOpacityOf,
  type MachineCall,
} from '../machine/MachineCalls';
import type { MachineLink, MachineSection } from '../machine/MachineTypes';

export {
  B_WALLS,
  B_WALL_RESTI,
  B_LAUNCHER,
  B_WALL_GATE,
  B_FIELD,
  B_FLIPPER_LEFT,
  B_CIRCLE,
  B_CONVEYER,
  B_COLLECTABLE,
  B_FAN,
  B_PORTAL,
  B_TRIANGLE,
  B_DECORATION,
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_PLAY_SOUND,
  DEC_BLINKING_LIGHT,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
} from '../machine/MachineCalls';

export const SECTION_SIDE_BOTTOM = 0;
export const SECTION_SIDE_TOP = 1;
export const SECTION_SIDE_LEFT = 2;
export const SECTION_SIDE_RIGHT = 3;

const applyPartProps = (part: Part, call: MachineCall) => {
  if ('id' in call) {
    part.id = num(call.id);
  }
  part.opacity = partOpacityOf(call);
};

const pushWalls = (
  section: Section,
  segments: { x0: number; y0: number; x1: number; y1: number; id?: number }[],
  rest = 0.5
) => {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    section.walls.push(
      lineCreate(s.x0, s.y0, s.x1, s.y1, rest, -1, 0, num(s.id))
    );
  }
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

const TRIANGLE_COLOR = 1;

export const buildCall = (section: Section, call: MachineCall) => {
  if (call.kind === B_WALLS) {
    pushWalls(section, call.segments);
    return;
  }
  if (call.kind === B_WALL_RESTI) {
    section.walls.push(
      lineCreate(
        call.x0,
        call.y0,
        call.x1,
        call.y1,
        call.rest == null ? 0.5 : call.rest,
        -1,
        0,
        num(call.id)
      )
    );
    return;
  }
  if (call.kind === B_WALL_GATE) {
    const c = num(call.color);
    section.walls.push(
      lineCreate(
        call.x0,
        call.y0,
        call.x1,
        call.y1,
        0.5,
        c < 0 ? 0 : c % palette().length,
        0,
        num(call.id)
      )
    );
    return;
  }
  if (call.kind === B_FLIPPER_LEFT) {
    const rest = call.restAngle == null ? LEFT_REST_ANGLE : call.restAngle;
    const up = call.upAngle == null ? LEFT_UP : call.upAngle;
    const flipped = !!call.flipped;
    const paddle = new Paddle(
      call.x,
      call.y,
      flipped ? CONTROL_RIGHT : CONTROL_LEFT,
      flipped ? Math.PI - rest : rest,
      flipped ? Math.PI - up : up,
      num(call.length) > 0 ? call.length : PADDLE_LEN
    );
    applyPartProps(paddle, call);
    section.parts.push(paddle);
    return;
  }
  if (call.kind === B_LAUNCHER) {
    const launcher = new Launcher(
      call.x,
      call.y,
      CONTROL_START,
      call.dx,
      call.dy,
      call.force,
      call.range,
      call.chargeMs,
      call.length
    );
    applyPartProps(launcher, call);
    section.parts.push(launcher);
    return;
  }
  if (call.kind === B_FIELD) {
    const trig = fieldTriggerId(call.trigger);
    const Ctor = TRIGGERS[trig] || Trigger;
    const field = new Field(call.x, call.y, call.w, call.h);
    if (trig === TRIGGER_ACTIVATE_LIGHT) {
      field.trigger = new Ctor([
        num(call.part),
        num(call.onDelay),
        num(call.offDelay),
      ]);
    } else if (trig === TRIGGER_PLAY_SOUND) {
      field.trigger = new Ctor([num(call.sound)]);
    } else {
      field.trigger = new Ctor([
        num(call.wall),
        num(call.onDelay),
        num(call.offDelay),
      ]);
    }
    applyPartProps(field, call);
    section.parts.push(field);
    return;
  }
  if (call.kind === B_CONVEYER) {
    const angle = call.angle || 0;
    const power = call.power || 0;
    const field = new Field(
      call.x,
      call.y,
      call.w,
      call.h,
      0,
      Math.cos(angle) * power,
      Math.sin(angle) * power,
      call.maxSpeed ?? 0
    );
    field.drag = call.drag ?? 0;
    applyPartProps(field, call);
    section.parts.push(field);
    return;
  }
  if (call.kind === B_CIRCLE) {
    const part = makeCircle(
      call.x,
      call.y,
      call.resolution ?? 10,
      call.restitution ?? 1,
      call.radius ?? 20,
      call.dx ?? 0,
      call.dy ?? 0,
      call.omega ?? 0,
      call.icon ?? 0,
      call.color ?? 0
    );
    applyPartProps(part, call);
    section.parts.push(part);
    return;
  }
  if (call.kind === B_FAN) {
    const part = makeFan(
      call.x,
      call.y,
      call.paddles ?? 4,
      call.restitution ?? 1,
      call.radius ?? 40,
      0,
      0,
      call.omega ?? 0
    );
    applyPartProps(part, call);
    section.parts.push(part);
    return;
  }
  if (call.kind === B_COLLECTABLE) {
    const coin = new Collectable(call.x, call.y, 10, 0);
    applyPartProps(coin, call);
    section.parts.push(coin);
    return;
  }
  if (call.kind === B_PORTAL) {
    const c = num(call.color);
    const portal = new Portal(
      call.x0,
      call.y0,
      call.x1,
      call.y1,
      18,
      c < 0 ? 0 : c % palette().length
    );
    applyPartProps(portal, call);
    section.parts.push(portal);
    return;
  }
  if (call.kind === B_TRIANGLE) {
    const v = triangleVerts(
      call.x,
      call.y,
      call.sideLen1 ?? 60,
      call.sideLen2 ?? 60,
      call.rot || 0
    );
    section.fills.push([v.x0, v.y0, v.x1, v.y1, v.x2, v.y2, TRIANGLE_COLOR]);
    section.walls.push(
      lineCreate(
        v.x1,
        v.y1,
        v.x2,
        v.y2,
        call.resti0 == null ? 0.5 : call.resti0,
        -1,
        SOUND_HIT_FAN,
        num(call.id0)
      )
    );
    section.walls.push(
      lineCreate(
        v.x0,
        v.y0,
        v.x1,
        v.y1,
        call.resti1 == null ? 0.5 : call.resti1,
        -1,
        0,
        num(call.id1)
      )
    );
    section.walls.push(
      lineCreate(
        v.x0,
        v.y0,
        v.x2,
        v.y2,
        call.resti2 == null ? 0.5 : call.resti2,
        -1,
        0,
        num(call.id2)
      )
    );
    return;
  }
  if (call.kind === B_DECORATION) {
    const style = decorationStyleId(call.decoration);
    let extra: number[] = [];
    if (style === DEC_BLINKING_LIGHT_LINE) {
      extra = [
        call.interval ?? 400,
        num(call.shape),
        num(call.count) || 1,
        call.x1 ?? call.x,
        call.y1 ?? call.y,
        num(call.delay),
        call.startOn == null ? 1 : call.startOn,
      ];
    } else if (style === DEC_ICON) {
      extra = [];
    } else if (style === DEC_RAINBOW) {
      extra = [call.w ?? 80, call.h ?? 40];
    } else {
      extra = [
        num(call.shape),
        call.startOn == null ? 1 : call.startOn,
        call.interval == null ? 1000 : call.interval,
      ];
    }
    const dec = new Decoration(
      call.x,
      call.y,
      call.scale == null ? 1 : call.scale,
      call.rot || 0,
      style,
      num(call.texture),
      extra
    );
    applyPartProps(dec, call);
    section.parts.push(dec);
  }
};

const buildSectionEdges = (sections: Section[], links: MachineLink[]) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const { w, h } = s;
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
        if (l.section === i && l.side === e) {
          o = l.offset;
          g = o + l.width;
          break;
        }
      }
      if (g) {
        if (y0 === y1) {
          pushWalls(s, [
            { x0, y0, x1: o, y1: y0 },
            { x0: g, y0, x1, y1: y0 },
          ]);
        } else {
          pushWalls(s, [
            { x0, y0, x1: x0, y1: o },
            { x0, y0: g, x1: x0, y1 },
          ]);
        }
      } else {
        pushWalls(s, [{ x0, y0, x1, y1 }]);
      }
    }
  }
};

export const buildLevel = (
  sectionData: MachineSection[],
  links: MachineLink[]
): Section[] => {
  const sections = sectionData.map((d, i) =>
    sectionCreate(i, d.x, d.y, d.w, d.h)
  );
  buildSectionEdges(sections, links);
  for (let i = 0; i < sectionData.length; i++) {
    const calls = sectionData[i].calls;
    for (let j = 0; j < calls.length; j++) {
      buildCall(sections[i], calls[j]);
    }
  }
  return sections;
};
