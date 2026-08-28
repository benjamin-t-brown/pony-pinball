import { memo, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { B_CIRCLE, B_COLLECTABLE, B_CONVEYER, B_DECORATION, B_FAN, B_FIELD, B_FLIPPER_LEFT, B_LAUNCHER, B_PORTAL, B_TRIANGLE, B_WALL_RESTI, B_WALLS, GATE_COLORS, buildLevel, triangleVerts } from '@game/model/builders';
import {
  PART_COLLECTABLE,
  PART_DECORATION,
  PART_FIELD,
  PART_LAUNCHER,
  PART_PADDLE,
  PART_PORTAL,
} from '@game/model/Part';
import {
  PADDLE_LEN,
  LAUNCHER_LEN,
} from '@game/model/constants';
import type { Collectable } from '@game/model/parts/Collectable';
import {
  CHEVRON_D,
  DEC_ICON,
  DEC_RAINBOW,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
  TEX_ARROWS,
  decorationFill,
  decorationLightAt,
  decorationLightCount,
  getTextureClass,
  lightAnimation,
  type Decoration,
} from '@game/model/parts/Decoration';
import type { Field } from '@game/model/parts/Field';
import type { Launcher } from '@game/model/parts/Launcher';
import {
  CIRCLE_DIAMOND,
  DIAMOND_D,
  STAR_D,
  circleFill,
  obstacleStroke,
  type Obstacle,
} from '@game/model/parts/Obstacle';
import type { Paddle } from '@game/model/parts/Paddle';
import type { Portal } from '@game/model/parts/Portal';
import type { Section } from '@game/model/Section';
import type { State } from '@game/state/State';
import {
  applyHandle,
  clampDeltaInRect,
  clampLocal,
  clampRectLocal,
  cloneSections,
  distToSegment,
  findSectionAt,
  findSharedEdgeAt,
  HANDLE_LIVE,
  handlePositions,
  normalizeFieldRect,
  normalizeRect,
  px,
  sharedBoundary,
  snapPolar,
  snapRect,
  SNAP_PX,
  ANGLE_SNAP,
  roundAngle,
  toLocal,
  type Handle,
} from '../geometry';
import {
  clampOpening,
  DEFAULT_OPENING_WIDTH,
  openingSpan,
  openingsToLinks,
} from '../openings';
import { isDecLightLine, isDecRainbow, placeDefaults, triggerDefFor } from '../schema';
import { TRIGGER_GATE_SECTION_4 } from '@game/model/Trigger';
import { collectPlayEls, syncPlayVisuals } from '../playVisuals';
import type { Cam, Opening, SectionData, Selection, Tool } from '../types';
import { isSegmentWallCall, restiWallIndices } from '../wallRefs';

type Drag =
  | { kind: 'pan'; lx: number; ly: number }
  | { kind: 'create'; x0: number; y0: number }
  | {
      kind: 'move';
      index: number;
      x0: number;
      y0: number;
      ox: number;
      oy: number;
    }
  | { kind: 'resize'; index: number; handle: Handle; orig: SectionData }
  | { kind: 'wall'; section: number; x0: number; y0: number; id: number }
  | { kind: 'field'; section: number; x0: number; y0: number; id: number }
  | {
      kind: 'resizeField';
      section: number;
      call: number;
      handle: Handle;
      orig: [number, number, number, number];
    }
  | {
      kind: 'rotateAim';
      section: number;
      call: number;
    }
  | {
      kind: 'moveCall';
      section: number;
      call: number;
      ox: number;
      oy: number;
      ox1: number;
      oy1: number;
      x0: number;
      y0: number;
    }
  | {
      kind: 'moveCallEnd';
      section: number;
      call: number;
      end: 0 | 1;
    }
  | {
      kind: 'moveWall';
      section: number;
      call: number;
      segment: number;
      ox0: number;
      oy0: number;
      ox1: number;
      oy1: number;
      x0: number;
      y0: number;
    }
  | {
      kind: 'moveWallEnd';
      section: number;
      call: number;
      segment: number;
      end: 0 | 1;
    }
  | {
      kind: 'moveOpening';
      index: number;
      grab: number;
    }
  | {
      kind: 'resizeOpening';
      index: number;
      fixed: number;
    };

type Props = {
  sections: SectionData[];
  openings: Opening[];
  selection: Selection;
  tool: Tool;
  cam: Cam;
  playing: boolean;
  spawn: { x: number; y: number } | null;
  built: Section[];
  sim: State | null;
  onSections: (sections: SectionData[]) => void;
  onOpenings: (openings: Opening[]) => void;
  onSelection: (selection: Selection) => void;
  onTool: (tool: Tool) => void;
  onCam: (cam: Cam) => void;
  onDropBall: (x: number, y: number) => void;
  onViewport: (w: number, h: number) => void;
  onCursor: (x: number, y: number) => void;
};

const isRectBuilder = (id: number) => {
  return id === B_FIELD || id === B_CONVEYER;
};

const CONVEYER_ARROW_LEN = 28;

const conveyerArrowWorld = (section: SectionData, call: number[]) => {
  const cx = section[0] + call[1] + call[3] / 2;
  const cy = section[1] + call[2] + call[4] / 2;
  const angle = call[5];
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  return {
    cx,
    cy,
    angle,
    x0: cx - ca * CONVEYER_ARROW_LEN,
    y0: cy - sa * CONVEYER_ARROW_LEN,
    x1: cx + ca * CONVEYER_ARROW_LEN,
    y1: cy + sa * CONVEYER_ARROW_LEN,
  };
};

const hitConveyerTip = (
  section: SectionData,
  call: number[],
  sx: number,
  sy: number,
  cam: Cam
) => {
  if (call[0] !== B_CONVEYER) {
    return false;
  }
  const arrow = conveyerArrowWorld(section, call);
  const hx = (arrow.x1 - cam.x) * cam.scale;
  const hy = (arrow.y1 - cam.y) * cam.scale;
  return Math.hypot(sx - hx, sy - hy) <= 10;
};

const triangleWorld = (section: SectionData, call: number[]) => {
  const v = triangleVerts(call[1], call[2], call[3], call[4], call[5]);
  return {
    x0: section[0] + v.x0,
    y0: section[1] + v.y0,
    x1: section[0] + v.x1,
    y1: section[1] + v.y1,
    x2: section[0] + v.x2,
    y2: section[1] + v.y2,
  };
};

const hitTriangleTip = (
  section: SectionData,
  call: number[],
  sx: number,
  sy: number,
  cam: Cam
) => {
  if (call[0] !== B_TRIANGLE) {
    return false;
  }
  const t = triangleWorld(section, call);
  const hx = (t.x1 - cam.x) * cam.scale;
  const hy = (t.y1 - cam.y) * cam.scale;
  return Math.hypot(sx - hx, sy - hy) <= 10;
};

const DEC_AIM_LEN = 18;

const decorationTipWorld = (section: SectionData, call: number[]) => {
  let lx = call[1];
  let ly = call[2];
  if (isDecLightLine(call) && call.length >= 12) {
    const n = call[9] < 1 ? 1 : call[9] | 0;
    if (n <= 1) {
      lx = (call[1] + call[10]) * 0.5;
      ly = (call[2] + call[11]) * 0.5;
    }
  }
  const ox = section[0] + lx;
  const oy = section[1] + ly;
  const scale = call[3] || 1;
  const rot = call[4] || 0;
  const len = DEC_AIM_LEN * scale;
  return {
    x: ox + Math.cos(rot) * len,
    y: oy + Math.sin(rot) * len,
    ox,
    oy,
  };
};

const hitDecorationTip = (
  section: SectionData,
  call: number[],
  sx: number,
  sy: number,
  cam: Cam
) => {
  if (call[0] !== B_DECORATION) {
    return false;
  }
  const tip = decorationTipWorld(section, call);
  const hx = (tip.x - cam.x) * cam.scale;
  const hy = (tip.y - cam.y) * cam.scale;
  return Math.hypot(sx - hx, sy - hy) <= 10;
};

const launcherDrawLen = (call: number[]) => {
  return call[8] > 0 ? call[8] : LAUNCHER_LEN;
};

const launcherTipWorld = (section: SectionData, call: number[]) => {
  const origin = callOrigin(section, call);
  const dx = call[3];
  const dy = call[4];
  const len = Math.hypot(dx, dy) || 1;
  const draw = launcherDrawLen(call);
  return {
    x: origin.x - (dx / len) * draw,
    y: origin.y - (dy / len) * draw,
    ox: origin.x,
    oy: origin.y,
  };
};

const hitLauncherTip = (
  section: SectionData,
  call: number[],
  sx: number,
  sy: number,
  cam: Cam
) => {
  if (call[0] !== B_LAUNCHER) {
    return false;
  }
  const tip = launcherTipWorld(section, call);
  const hx = (tip.x - cam.x) * cam.scale;
  const hy = (tip.y - cam.y) * cam.scale;
  return Math.hypot(sx - hx, sy - hy) <= 10;
};

const hitAimTip = (
  section: SectionData,
  call: number[],
  sx: number,
  sy: number,
  cam: Cam
) => {
  return (
    hitConveyerTip(section, call, sx, sy, cam) ||
    hitLauncherTip(section, call, sx, sy, cam) ||
    hitTriangleTip(section, call, sx, sy, cam) ||
    hitDecorationTip(section, call, sx, sy, cam)
  );
};

const callOrigin = (section: SectionData, call: number[]) => {
  return { x: section[0] + call[1], y: section[1] + call[2] };
};

const flipperPose = (call: number[]) => {
  const flipped = call[5];
  const rest = call[3];
  const up = call[4];
  return {
    rest: flipped ? Math.PI - rest : rest,
    up: flipped ? Math.PI - up : up,
  };
};

const paddleRay = (
  origin: { x: number; y: number },
  angle: number,
  len: number
) => {
  return {
    x0: origin.x,
    y0: origin.y,
    x1: origin.x + len * Math.cos(angle),
    y1: origin.y + len * Math.sin(angle),
  };
};

const callVisualSegment = (section: SectionData, call: number[]) => {
  const origin = callOrigin(section, call);
  if (call[0] === B_FLIPPER_LEFT) {
    const len = call[6] > 0 ? call[6] : PADDLE_LEN;
    return paddleRay(origin, flipperPose(call).rest, len);
  }
  if (call[0] === B_LAUNCHER) {
    const dx = call[3];
    const dy = call[4];
    const len = Math.hypot(dx, dy) || 1;
    const draw = launcherDrawLen(call);
    return {
      x0: origin.x,
      y0: origin.y,
      x1: origin.x - (dx / len) * draw,
      y1: origin.y - (dy / len) * draw,
    };
  }
  if (call[0] === B_PORTAL && call.length >= 5) {
    return {
      x0: origin.x,
      y0: origin.y,
      x1: section[0] + call[3],
      y1: section[1] + call[4],
    };
  }
  if (isDecLightLine(call) && call.length >= 12) {
    return {
      x0: origin.x,
      y0: origin.y,
      x1: section[0] + call[10],
      y1: section[1] + call[11],
    };
  }
  return null;
};

const hitsCall = (
  section: SectionData,
  call: number[],
  wx: number,
  wy: number,
  slop: number
) => {
  if (call.length < 3) {
    return false;
  }
  const origin = callOrigin(section, call);
  const fat = Math.max(slop, 8);
  if (call[0] === B_PORTAL && call.length >= 5) {
    const r = 18 + slop;
    const x1 = section[0] + call[3];
    const y1 = section[1] + call[4];
    return (
      Math.hypot(wx - origin.x, wy - origin.y) < r ||
      Math.hypot(wx - x1, wy - y1) < r ||
      distToSegment(wx, wy, origin.x, origin.y, x1, y1) < fat
    );
  }
  const segment = callVisualSegment(section, call);
  if (segment) {
    if (distToSegment(wx, wy, segment.x0, segment.y0, segment.x1, segment.y1) < fat) {
      return true;
    }
    if (call[0] === B_FLIPPER_LEFT) {
      const len = call[6] > 0 ? call[6] : PADDLE_LEN;
      const up = paddleRay(origin, flipperPose(call).up, len);
      if (distToSegment(wx, wy, up.x0, up.y0, up.x1, up.y1) < fat) {
        return true;
      }
    }
    return false;
  }
  if (call[0] === B_CIRCLE || call[0] === B_FAN) {
    const r = call[5];
    return Math.hypot(wx - origin.x, wy - origin.y) < r + slop;
  }
  if (call[0] === B_COLLECTABLE) {
    return Math.hypot(wx - origin.x, wy - origin.y) < 10 + slop;
  }
  if (call[0] === B_DECORATION) {
    if (isDecLightLine(call) && call.length >= 12) {
      const x1 = section[0] + call[10];
      const y1 = section[1] + call[11];
      return distToSegment(wx, wy, origin.x, origin.y, x1, y1) < fat;
    }
    if (isDecRainbow(call) && call.length >= 9) {
      const w = call[7];
      const h = call[8];
      return (
        wx >= origin.x - slop &&
        wx <= origin.x + w + slop &&
        wy >= origin.y - slop &&
        wy <= origin.y + h + slop
      );
    }
    const r = Math.max(12, (call[3] || 1) * 12);
    return Math.hypot(wx - origin.x, wy - origin.y) < r + slop;
  }
  if (call[0] === B_TRIANGLE && call.length >= 6) {
    const t = triangleWorld(section, call);
    return (
      distToSegment(wx, wy, t.x0, t.y0, t.x1, t.y1) < fat ||
      distToSegment(wx, wy, t.x0, t.y0, t.x2, t.y2) < fat ||
      distToSegment(wx, wy, t.x1, t.y1, t.x2, t.y2) < fat
    );
  }
  if (isRectBuilder(call[0])) {
    const x = origin.x;
    const y = origin.y;
    const w = call[3];
    const h = call[4];
    return wx >= x - slop && wx <= x + w + slop && wy >= y - slop && wy <= y + h + slop;
  }
  return Math.hypot(wx - origin.x, wy - origin.y) < slop * 2;
};

const hitTest = (
  sections: SectionData[],
  openings: Opening[],
  wx: number,
  wy: number,
  slop: number
): Selection => {
  for (let si = sections.length - 1; si >= 0; si--) {
    const s = sections[si];
    const calls = s[4];
    for (let ci = calls.length - 1; ci >= 0; ci--) {
      const call = calls[ci];
      if (call[0] === B_WALLS) {
        for (let k = 1; k + 3 < call.length; k += 4) {
          const d = distToSegment(
            wx,
            wy,
            s[0] + call[k],
            s[1] + call[k + 1],
            s[0] + call[k + 2],
            s[1] + call[k + 3]
          );
          if (d < slop) {
            return {
              kind: 'wall',
              section: si,
              call: ci,
              segment: (k - 1) / 4,
            };
          }
        }
      } else if (isSegmentWallCall(call[0]) && call.length >= 5) {
        const d = distToSegment(
          wx,
          wy,
          s[0] + call[1],
          s[1] + call[2],
          s[0] + call[3],
          s[1] + call[4]
        );
        if (d < slop) {
          return {
            kind: 'wall',
            section: si,
            call: ci,
            segment: 0,
          };
        }
      } else if (hitsCall(s, call, wx, wy, slop)) {
        return { kind: 'call', section: si, call: ci };
      }
    }
  }
  for (let i = 0; i < openings.length; i++) {
    const span = openingSpan(openings[i], sections);
    if (!span) {
      continue;
    }
    const d =
      span.axis === 'h'
        ? distToSegment(wx, wy, span.lo, span.pos, span.hi, span.pos)
        : distToSegment(wx, wy, span.pos, span.lo, span.pos, span.hi);
    if (d < slop) {
      return { kind: 'opening', index: i };
    }
  }
  const si = findSectionAt(sections, wx, wy);
  if (si >= 0) {
    return { kind: 'section', index: si };
  }
  return null;
};

const wallWorldEnds = (
  sections: SectionData[],
  section: number,
  call: number,
  segment: number
) => {
  const s = sections[section];
  const c = s && s[4][call];
  if (!s || !c) {
    return null;
  }
  const k = 1 + segment * 4;
  if (c.length < k + 4) {
    return null;
  }
  return [
    { x: s[0] + c[k], y: s[1] + c[k + 1] },
    { x: s[0] + c[k + 2], y: s[1] + c[k + 3] },
  ] as const;
};

const openingWorldEnds = (
  openings: Opening[],
  sections: SectionData[],
  index: number
) => {
  const span = openingSpan(openings[index], sections);
  if (!span) {
    return null;
  }
  if (span.axis === 'h') {
    return [
      { x: span.lo, y: span.pos },
      { x: span.hi, y: span.pos },
    ] as const;
  }
  return [
    { x: span.pos, y: span.lo },
    { x: span.pos, y: span.hi },
  ] as const;
};

const hitOpeningEnd = (
  openings: Opening[],
  sections: SectionData[],
  index: number,
  sx: number,
  sy: number,
  cam: Cam
): 0 | 1 | null => {
  const ends = openingWorldEnds(openings, sections, index);
  if (!ends) {
    return null;
  }
  const r = 8;
  let best: 0 | 1 | null = null;
  let bestD = r;
  for (let i = 0; i < 2; i++) {
    const hx = (ends[i].x - cam.x) * cam.scale;
    const hy = (ends[i].y - cam.y) * cam.scale;
    const d = Math.hypot(sx - hx, sy - hy);
    if (d <= bestD) {
      bestD = d;
      best = i as 0 | 1;
    }
  }
  return best;
};

const hitWallEnd = (
  sections: SectionData[],
  sel: { section: number; call: number; segment: number },
  sx: number,
  sy: number,
  cam: Cam
): 0 | 1 | null => {
  const ends = wallWorldEnds(sections, sel.section, sel.call, sel.segment);
  if (!ends) {
    return null;
  }
  const r = 8;
  let best: 0 | 1 | null = null;
  let bestD = r;
  for (let i = 0; i < 2; i++) {
    const hx = (ends[i].x - cam.x) * cam.scale;
    const hy = (ends[i].y - cam.y) * cam.scale;
    const d = Math.hypot(sx - hx, sy - hy);
    if (d <= bestD) {
      bestD = d;
      best = i as 0 | 1;
    }
  }
  return best;
};

const callEndLocal = (call: number[], end: 0 | 1) => {
  if (call[0] === B_PORTAL && call.length >= 5) {
    return {
      xi: 1 + end * 2,
      yi: 2 + end * 2,
    };
  }
  if (isDecLightLine(call) && call.length >= 12) {
    return {
      xi: end ? 10 : 1,
      yi: end ? 11 : 2,
    };
  }
  return null;
};

const hitCallEnd = (
  section: SectionData,
  call: number[],
  sx: number,
  sy: number,
  cam: Cam
): 0 | 1 | null => {
  const a = callEndLocal(call, 0);
  const b = callEndLocal(call, 1);
  if (!a || !b) {
    return null;
  }
  const ends = [
    { x: section[0] + call[a.xi], y: section[1] + call[a.yi] },
    { x: section[0] + call[b.xi], y: section[1] + call[b.yi] },
  ];
  const r = 8;
  let best: 0 | 1 | null = null;
  let bestD = r;
  for (let i = 0; i < 2; i++) {
    const hx = (ends[i].x - cam.x) * cam.scale;
    const hy = (ends[i].y - cam.y) * cam.scale;
    const d = Math.hypot(sx - hx, sy - hy);
    if (d <= bestD) {
      bestD = d;
      best = i as 0 | 1;
    }
  }
  return best;
};

const hitHandle = (
  section: SectionData,
  sx: number,
  sy: number,
  cam: Cam
): Handle | null => {
  const handles = handlePositions(section);
  const r = 8;
  for (let i = 0; i < handles.length; i++) {
    const hx = (handles[i].x - cam.x) * cam.scale;
    const hy = (handles[i].y - cam.y) * cam.scale;
    if (Math.hypot(sx - hx, sy - hy) <= r) {
      return handles[i].id;
    }
  }
  return null;
};

const fieldWorld = (section: SectionData, call: number[]): SectionData => {
  return [section[0] + call[1], section[1] + call[2], call[3], call[4], []];
};

const fieldCorners = (rect: SectionData) => {
  return handlePositions(rect).filter(h => h.id.length === 2);
};

const hitFieldHandle = (
  rect: SectionData,
  sx: number,
  sy: number,
  cam: Cam
): Handle | null => {
  const handles = fieldCorners(rect);
  const r = 8;
  for (let i = 0; i < handles.length; i++) {
    const hx = (handles[i].x - cam.x) * cam.scale;
    const hy = (handles[i].y - cam.y) * cam.scale;
    if (Math.hypot(sx - hx, sy - hy) <= r) {
      return handles[i].id;
    }
  }
  return null;
};

const ensureWallsCall = (section: SectionData) => {
  for (let i = 0; i < section[4].length; i++) {
    if (section[4][i][0] === B_WALLS) {
      return i;
    }
  }
  section[4].unshift([B_WALLS]);
  return 0;
};

export const WorldCanvas = ({
  sections,
  openings,
  selection,
  tool,
  cam,
  playing,
  spawn,
  built,
  sim,
  onSections,
  onOpenings,
  onSelection,
  onTool,
  onCam,
  onDropBall,
  onViewport,
  onCursor,
}: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const wallGhostRef = useRef<SVGLineElement | null>(null);
  const rectGhostRef = useRef<SVGRectElement | null>(null);
  const draftSec = useRef<SectionData[] | null>(null);
  const draftOpen = useRef<Opening[] | null>(null);
  const paintRaf = useRef(0);
  const camRaf = useRef(0);
  const pendingCam = useRef<Cam | null>(null);
  const [draftRev, setDraftRev] = useState(0);
  const [liveCam, setLiveCam] = useState<Cam | null>(null);
  const [showWallIds, setShowWallIds] = useState(false);

  const viewCam = liveCam ?? cam;

  const showWallGhost = (x0: number, y0: number, x1: number, y1: number) => {
    const el = wallGhostRef.current;
    if (!el) {
      return;
    }
    el.setAttribute('x1', String(x0));
    el.setAttribute('y1', String(y0));
    el.setAttribute('x2', String(x1));
    el.setAttribute('y2', String(y1));
    el.style.display = '';
  };
  const hideWallGhost = () => {
    if (wallGhostRef.current) {
      wallGhostRef.current.style.display = 'none';
    }
  };
  const showRectGhost = (x: number, y: number, w: number, h: number) => {
    const el = rectGhostRef.current;
    if (!el) {
      return;
    }
    el.setAttribute('x', String(x));
    el.setAttribute('y', String(y));
    el.setAttribute('width', String(Math.max(0, w)));
    el.setAttribute('height', String(Math.max(0, h)));
    el.style.display = '';
  };
  const hideRectGhost = () => {
    if (rectGhostRef.current) {
      rectGhostRef.current.style.display = 'none';
    }
  };

  const bumpDraft = () => {
    if (!paintRaf.current) {
      paintRaf.current = requestAnimationFrame(() => {
        paintRaf.current = 0;
        setDraftRev(r => r + 1);
      });
    }
  };
  const beginDraftSections = () => {
    if (!draftSec.current) {
      draftSec.current = cloneSections(sections);
    }
    return draftSec.current;
  };
  const beginDraftOpenings = () => {
    if (!draftOpen.current) {
      draftOpen.current = openings.map(o => ({ ...o }));
    }
    return draftOpen.current;
  };
  const commitDraft = () => {
    if (paintRaf.current) {
      cancelAnimationFrame(paintRaf.current);
      paintRaf.current = 0;
    }
    if (draftSec.current) {
      onSections(draftSec.current);
      draftSec.current = null;
    }
    if (draftOpen.current) {
      onOpenings(draftOpen.current);
      draftOpen.current = null;
    }
  };

  const bumpCam = (next: Cam) => {
    pendingCam.current = next;
    if (!camRaf.current) {
      camRaf.current = requestAnimationFrame(() => {
        camRaf.current = 0;
        const camToShow = pendingCam.current;
        if (camToShow) {
          setLiveCam(camToShow);
        }
      });
    }
  };

  const viewSections = draftSec.current ?? sections;
  const viewOpenings = draftOpen.current ?? openings;

  const viewBuilt = useMemo(() => {
    if (playing && sim) {
      return sim.sections;
    }
    try {
      return buildLevel(viewSections, openingsToLinks(viewSections, viewOpenings));
    } catch {
      return [];
    }
  }, [playing, sim, viewSections, viewOpenings, draftRev, sections, openings]);

  useEffect(() => {
    if (!playing || !sim) {
      return;
    }
    const root = wrapRef.current;
    if (!root) {
      return;
    }
    const cache = collectPlayEls(root);
    let id = 0;
    const loop = () => {
      syncPlayVisuals(cache, sim);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
    };
  }, [playing, sim]);

  useEffect(() => {
    if (!dragRef.current) {
      draftSec.current = null;
      draftOpen.current = null;
    }
  }, [sections, openings]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    const report = () => {
      onViewport(el.clientWidth, el.clientHeight);
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [onViewport]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowWallIds(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowWallIds(false);
      }
    };
    const blur = () => {
      setShowWallIds(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [playing]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = viewCam.x + sx / viewCam.scale;
      const wy = viewCam.y + sy / viewCam.scale;
      const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      const scale = Math.max(0.15, Math.min(4, viewCam.scale * factor));
      onCam({
        scale,
        x: wx - sx / scale,
        y: wy - sy / scale,
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [viewCam, onCam]);

  const localPoint = (e: PointerEvent) => {
    const el = wrapRef.current;
    if (!el) {
      return { sx: 0, sy: 0, wx: 0, wy: 0 };
    }
    const rect = el.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return {
      sx,
      sy,
      wx: viewCam.x + sx / viewCam.scale,
      wy: viewCam.y + sy / viewCam.scale,
    };
  };

  const snapDist = SNAP_PX / viewCam.scale;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const { sx, sy, wx, wy } = localPoint(e);
    onCursor(wx, wy);
    if (e.button === 1) {
      e.preventDefault();
      dragRef.current = { kind: 'pan', lx: e.clientX, ly: e.clientY };
      return;
    }
    if (playing) {
      if (e.button === 0) {
        onDropBall(wx, wy);
      }
      return;
    }
    if (e.button !== 0) {
      return;
    }

    if (tool.kind === 'section') {
      dragRef.current = { kind: 'create', x0: wx, y0: wy };
      const g = normalizeRect(wx, wy, wx, wy);
      showRectGhost(g.x, g.y, g.w, g.h);
      return;
    }

    if (tool.kind === 'opening') {
      const existing = hitTest(
        viewSections,
        viewOpenings,
        wx,
        wy,
        Math.max(4, 8 / viewCam.scale)
      );
      if (existing && existing.kind === 'opening') {
        const o = viewOpenings[existing.index];
        const span = openingSpan(o, viewSections);
        onSelection(existing);
        if (span) {
          const end = hitOpeningEnd(
            viewOpenings,
            viewSections,
            existing.index,
            sx,
            sy,
            viewCam
          );
          if (end !== null) {
            const o2 = viewOpenings[existing.index];
            dragRef.current = {
              kind: 'resizeOpening',
              index: existing.index,
              fixed: end === 0 ? o2.offset + o2.width : o2.offset,
            };
          } else {
            const along = span.axis === 'h' ? wx : wy;
            dragRef.current = {
              kind: 'moveOpening',
              index: existing.index,
              grab: along - o.offset,
            };
          }
        }
        return;
      }
      const hit = findSharedEdgeAt(viewSections, wx, wy, snapDist * 2);
      if (hit) {
        const along = hit.axis === 'h' ? wx : wy;
        const maxW = hit.hi - hit.lo;
        const width = Math.min(DEFAULT_OPENING_WIDTH, maxW);
        const offset = Math.max(hit.lo, Math.min(along - width / 2, hit.hi - width));
        const created = clampOpening(
          {
            a: hit.a,
            aSide: hit.aSide,
            b: hit.b,
            bSide: hit.bSide,
            offset,
            width,
          },
          viewSections
        );
        const next = viewOpenings.filter(o => {
          const uses = (si: number, side: number) =>
            (o.a === si && o.aSide === side) || (o.b === si && o.bSide === side);
          return !uses(hit.a, hit.aSide) && !uses(hit.b, hit.bSide);
        });
        next.push(created);
        onOpenings(next);
        onSelection({ kind: 'opening', index: next.length - 1 });
      }
      return;
    }

    if (tool.kind === 'builder') {
      const si = findSectionAt(viewSections, wx, wy);
      if (si < 0) {
        return;
      }
      const raw = toLocal(viewSections[si], wx, wy);
      const local = clampLocal(viewSections[si], raw.x, raw.y);
      if (tool.id === B_WALLS || isSegmentWallCall(tool.id) || tool.id === B_PORTAL) {
        dragRef.current = {
          kind: 'wall',
          section: si,
          x0: local.x,
          y0: local.y,
          id: tool.id,
        };
        showWallGhost(wx, wy, wx, wy);
        return;
      }
      if (isRectBuilder(tool.id)) {
        dragRef.current = {
          kind: 'field',
          section: si,
          x0: local.x,
          y0: local.y,
          id: tool.id,
        };
        showRectGhost(wx, wy, 0, 0);
        return;
      }
      const next = cloneSections(viewSections);
      next[si][4].push(placeDefaults(tool.id, local.x, local.y));
      onSections(next);
      onSelection({ kind: 'call', section: si, call: next[si][4].length - 1 });
      return;
    }

    if (selection && selection.kind === 'call') {
      const s = viewSections[selection.section];
      const call = s && s[4][selection.call];
      if (s && call) {
        if (hitAimTip(s, call, sx, sy, viewCam)) {
          dragRef.current = {
            kind: 'rotateAim',
            section: selection.section,
            call: selection.call,
          };
          return;
        }
        const portalEnd = hitCallEnd(s, call, sx, sy, viewCam);
        if (portalEnd !== null) {
          dragRef.current = {
            kind: 'moveCallEnd',
            section: selection.section,
            call: selection.call,
            end: portalEnd,
          };
          return;
        }
        if (isRectBuilder(call[0])) {
          const handle = hitFieldHandle(fieldWorld(s, call), sx, sy, viewCam);
          if (handle) {
            dragRef.current = {
              kind: 'resizeField',
              section: selection.section,
              call: selection.call,
              handle,
              orig: [call[1], call[2], call[3], call[4]],
            };
            return;
          }
        }
      }
    }

    if (selection && selection.kind === 'section') {
      const section = viewSections[selection.index];
      if (section) {
        const handle = hitHandle(section, sx, sy, viewCam);
        if (handle) {
          dragRef.current = {
            kind: 'resize',
            index: selection.index,
            handle,
            orig: [
              section[0],
              section[1],
              section[2],
              section[3],
              section[4],
            ],
          };
          return;
        }
      }
    }

    if (selection && selection.kind === 'opening') {
      const end = hitOpeningEnd(
        viewOpenings,
        viewSections,
        selection.index,
        sx,
        sy,
        viewCam
      );
      if (end !== null) {
        const o = viewOpenings[selection.index];
        dragRef.current = {
          kind: 'resizeOpening',
          index: selection.index,
          fixed: end === 0 ? o.offset + o.width : o.offset,
        };
        return;
      }
    }

    if (selection && selection.kind === 'wall') {
      const end = hitWallEnd(viewSections, selection, sx, sy, viewCam);
      if (end !== null) {
        dragRef.current = {
          kind: 'moveWallEnd',
          section: selection.section,
          call: selection.call,
          segment: selection.segment,
          end,
        };
        return;
      }
    }

    const hit = hitTest(viewSections, viewOpenings, wx, wy, Math.max(4, 8 / viewCam.scale));
    onSelection(hit);
    if (hit && hit.kind === 'section') {
      dragRef.current = {
        kind: 'move',
        index: hit.index,
        x0: wx,
        y0: wy,
        ox: viewSections[hit.index][0],
        oy: viewSections[hit.index][1],
      };
    }
    if (hit && hit.kind === 'call') {
      const s = viewSections[hit.section];
      const call = s && s[4][hit.call];
      if (call && call[0] !== B_WALLS && call.length >= 3) {
        if (hitAimTip(s, call, sx, sy, viewCam)) {
          dragRef.current = {
            kind: 'rotateAim',
            section: hit.section,
            call: hit.call,
          };
        } else {
          const portalEnd = hitCallEnd(s, call, sx, sy, viewCam);
          if (portalEnd !== null) {
            dragRef.current = {
              kind: 'moveCallEnd',
              section: hit.section,
              call: hit.call,
              end: portalEnd,
            };
          } else {
            dragRef.current = {
              kind: 'moveCall',
              section: hit.section,
              call: hit.call,
              ox: call[1],
              oy: call[2],
              ox1: isDecLightLine(call)
                ? call[10] ?? call[1]
                : call[3] ?? call[1],
              oy1: isDecLightLine(call)
                ? call[11] ?? call[2]
                : call[4] ?? call[2],
              x0: wx,
              y0: wy,
            };
          }
        }
      }
    }
    if (hit && hit.kind === 'wall') {
      const call = viewSections[hit.section][4][hit.call];
      const k = 1 + hit.segment * 4;
      if (call && call.length >= k + 4) {
        const end = hitWallEnd(viewSections, hit, sx, sy, viewCam);
        if (end !== null) {
          dragRef.current = {
            kind: 'moveWallEnd',
            section: hit.section,
            call: hit.call,
            segment: hit.segment,
            end,
          };
        } else {
          dragRef.current = {
            kind: 'moveWall',
            section: hit.section,
            call: hit.call,
            segment: hit.segment,
            ox0: call[k],
            oy0: call[k + 1],
            ox1: call[k + 2],
            oy1: call[k + 3],
            x0: wx,
            y0: wy,
          };
        }
      }
    }
    if (hit && hit.kind === 'opening') {
      const o = viewOpenings[hit.index];
      const span = openingSpan(o, viewSections);
      if (o && span) {
        const end = hitOpeningEnd(viewOpenings, viewSections, hit.index, sx, sy, viewCam);
        if (end !== null) {
          dragRef.current = {
            kind: 'resizeOpening',
            index: hit.index,
            fixed: end === 0 ? o.offset + o.width : o.offset,
          };
        } else {
          const along = span.axis === 'h' ? wx : wy;
          dragRef.current = {
            kind: 'moveOpening',
            index: hit.index,
            grab: along - o.offset,
          };
        }
      }
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const { wx, wy } = localPoint(e);
    onCursor(wx, wy);
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    if (drag.kind === 'pan') {
      const base = pendingCam.current ?? viewCam;
      bumpCam({
        ...base,
        x: base.x - (e.clientX - drag.lx) / base.scale,
        y: base.y - (e.clientY - drag.ly) / base.scale,
      });
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      return;
    }
    if (drag.kind === 'create') {
      const others = viewSections;
      const raw = normalizeRect(drag.x0, drag.y0, wx, wy);
      const snapped = snapRect(
        raw.x,
        raw.y,
        raw.w,
        raw.h,
        others,
        { l: true, r: true, t: true, b: true },
        snapDist
      );
      showRectGhost(snapped.x, snapped.y, snapped.w, snapped.h);
      return;
    }
    if (drag.kind === 'move') {
      const others = viewSections.filter((_, i) => i !== drag.index);
      const s = viewSections[drag.index];
      const snapped = snapRect(
        drag.ox + (wx - drag.x0),
        drag.oy + (wy - drag.y0),
        s[2],
        s[3],
        others,
        { l: true, r: true, t: true, b: true },
        snapDist
      );
      const next = beginDraftSections();
      next[drag.index][0] = snapped.x;
      next[drag.index][1] = snapped.y;
      const openNext = beginDraftOpenings();
      for (let i = 0; i < openNext.length; i++) {
        openNext[i] = clampOpening(openNext[i], next);
      }
      bumpDraft();
      return;
    }
    if (drag.kind === 'resize') {
      const others = viewSections.filter((_, i) => i !== drag.index);
      const raw = applyHandle(drag.orig, drag.handle, wx, wy);
      const snapped = snapRect(
        raw.x,
        raw.y,
        raw.w,
        raw.h,
        others,
        HANDLE_LIVE[drag.handle],
        snapDist
      );
      const next = beginDraftSections();
      next[drag.index][0] = snapped.x;
      next[drag.index][1] = snapped.y;
      next[drag.index][2] = snapped.w;
      next[drag.index][3] = snapped.h;
      const openNext = beginDraftOpenings();
      for (let i = 0; i < openNext.length; i++) {
        openNext[i] = clampOpening(openNext[i], next);
      }
      bumpDraft();
      return;
    }
    if (drag.kind === 'field') {
      const s = viewSections[drag.section];
      if (!s) {
        return;
      }
      const cur = toLocal(s, wx, wy);
      const p = clampLocal(s, cur.x, cur.y);
      const raw = normalizeFieldRect(drag.x0, drag.y0, p.x, p.y);
      const clamped = clampRectLocal(s, raw.x, raw.y, raw.w, raw.h);
      showRectGhost(
        s[0] + clamped.x,
        s[1] + clamped.y,
        clamped.w,
        clamped.h
      );
      return;
    }
    if (drag.kind === 'resizeField') {
      const s = viewSections[drag.section];
      if (!s) {
        return;
      }
      const p = toLocal(s, wx, wy);
      const raw = applyHandle(
        [drag.orig[0], drag.orig[1], drag.orig[2], drag.orig[3], []],
        drag.handle,
        p.x,
        p.y
      );
      const clamped = clampRectLocal(s, raw.x, raw.y, raw.w, raw.h);
      const next = beginDraftSections();
      const call = next[drag.section][4][drag.call];
      if (call) {
        call[1] = clamped.x;
        call[2] = clamped.y;
        call[3] = clamped.w;
        call[4] = clamped.h;
        bumpDraft();
      }
      return;
    }
    if (drag.kind === 'rotateAim') {
      const s = viewSections[drag.section];
      const call = s && s[4][drag.call];
      if (!s || !call) {
        return;
      }
      const next = beginDraftSections();
      const nextCall = next[drag.section][4][drag.call];
      if (call[0] === B_CONVEYER) {
        const cx = s[0] + call[1] + call[3] / 2;
        const cy = s[1] + call[2] + call[4] / 2;
        let ang = Math.atan2(wy - cy, wx - cx);
        if (e.shiftKey) {
          ang = Math.round(ang / ANGLE_SNAP) * ANGLE_SNAP;
        }
        nextCall[5] = roundAngle(ang);
      } else if (call[0] === B_LAUNCHER) {
        const ox = s[0] + call[1];
        const oy = s[1] + call[2];
        // Tip is drawn opposite the launch dir; aim the tip at the cursor.
        let ang = Math.atan2(wy - oy, wx - ox);
        if (e.shiftKey) {
          ang = Math.round(ang / ANGLE_SNAP) * ANGLE_SNAP;
        }
        ang = roundAngle(ang);
        nextCall[3] = roundAngle(-Math.cos(ang));
        nextCall[4] = roundAngle(-Math.sin(ang));
      } else if (call[0] === B_TRIANGLE) {
        const ox = s[0] + call[1];
        const oy = s[1] + call[2];
        let ang = Math.atan2(wy - oy, wx - ox);
        if (e.shiftKey) {
          ang = Math.round(ang / ANGLE_SNAP) * ANGLE_SNAP;
        }
        nextCall[5] = roundAngle(ang);
      } else if (call[0] === B_DECORATION) {
        const tip = decorationTipWorld(s, call);
        let ang = Math.atan2(wy - tip.oy, wx - tip.ox);
        if (e.shiftKey) {
          ang = Math.round(ang / ANGLE_SNAP) * ANGLE_SNAP;
        }
        nextCall[4] = roundAngle(ang);
      }
      bumpDraft();
      return;
    }
    if (drag.kind === 'wall') {
      const s = viewSections[drag.section];
      let x1 = wx;
      let y1 = wy;
      if (e.shiftKey && s) {
        const snapped = snapPolar(
          s[0] + drag.x0,
          s[1] + drag.y0,
          wx,
          wy
        );
        x1 = snapped.x;
        y1 = snapped.y;
      }
      showWallGhost(
        viewSections[drag.section][0] + drag.x0,
        viewSections[drag.section][1] + drag.y0,
        x1,
        y1
      );
    }
    if (drag.kind === 'moveCall') {
      const s = viewSections[drag.section];
      if (!s) {
        return;
      }
      const dx = wx - drag.x0;
      const dy = wy - drag.y0;
      const local = clampLocal(s, drag.ox + dx, drag.oy + dy);
      const next = beginDraftSections();
      const call = next[drag.section][4][drag.call];
      if (call && call.length >= 3) {
        if (isRectBuilder(call[0])) {
          const box = clampRectLocal(s, local.x, local.y, call[3], call[4]);
          call[1] = box.x;
          call[2] = box.y;
        } else if (call[0] === B_PORTAL) {
          const shifted = clampDeltaInRect(
            drag.ox,
            drag.oy,
            drag.ox1,
            drag.oy1,
            dx,
            dy,
            s[2],
            s[3]
          );
          call[1] = px(drag.ox + shifted.dx);
          call[2] = px(drag.oy + shifted.dy);
          call[3] = px(drag.ox1 + shifted.dx);
          call[4] = px(drag.oy1 + shifted.dy);
        } else if (isDecLightLine(call)) {
          const shifted = clampDeltaInRect(
            drag.ox,
            drag.oy,
            drag.ox1,
            drag.oy1,
            dx,
            dy,
            s[2],
            s[3]
          );
          call[1] = px(drag.ox + shifted.dx);
          call[2] = px(drag.oy + shifted.dy);
          call[10] = px(drag.ox1 + shifted.dx);
          call[11] = px(drag.oy1 + shifted.dy);
        } else {
          call[1] = local.x;
          call[2] = local.y;
        }
        bumpDraft();
      }
      return;
    }
    if (drag.kind === 'moveCallEnd') {
      const s = viewSections[drag.section];
      if (!s) {
        return;
      }
      const raw = toLocal(s, wx, wy);
      let local = clampLocal(s, raw.x, raw.y);
      if (e.shiftKey) {
        const src = s[4][drag.call];
        const other = callEndLocal(src, (1 - drag.end) as 0 | 1);
        if (other) {
          const snapped = snapPolar(
            src[other.xi],
            src[other.yi],
            local.x,
            local.y
          );
          local = clampLocal(s, snapped.x, snapped.y);
        }
      }
      const next = beginDraftSections();
      const call = next[drag.section][4][drag.call];
      const at = call && callEndLocal(call, drag.end);
      if (at) {
        call[at.xi] = local.x;
        call[at.yi] = local.y;
        bumpDraft();
      }
      return;
    }
    if (drag.kind === 'moveWall') {
      const s = viewSections[drag.section];
      if (!s) {
        return;
      }
      const shifted = clampDeltaInRect(
        drag.ox0,
        drag.oy0,
        drag.ox1,
        drag.oy1,
        wx - drag.x0,
        wy - drag.y0,
        s[2],
        s[3]
      );
      const next = beginDraftSections();
      const call = next[drag.section][4][drag.call];
      const k = 1 + drag.segment * 4;
      if (call && call.length >= k + 4) {
        call[k] = px(drag.ox0 + shifted.dx);
        call[k + 1] = px(drag.oy0 + shifted.dy);
        call[k + 2] = px(drag.ox1 + shifted.dx);
        call[k + 3] = px(drag.oy1 + shifted.dy);
        bumpDraft();
      }
      return;
    }
    if (drag.kind === 'moveWallEnd') {
      const s = viewSections[drag.section];
      if (!s) {
        return;
      }
      const raw = toLocal(s, wx, wy);
      let local = clampLocal(s, raw.x, raw.y);
      if (e.shiftKey) {
        const src = s[4][drag.call];
        const base = 1 + drag.segment * 4;
        const other = 1 - drag.end;
        const ox = src[base + other * 2];
        const oy = src[base + other * 2 + 1];
        const snapped = snapPolar(ox, oy, local.x, local.y);
        local = clampLocal(s, snapped.x, snapped.y);
      }
      const next = beginDraftSections();
      const call = next[drag.section][4][drag.call];
      const k = 1 + drag.segment * 4 + drag.end * 2;
      if (call && call.length > k + 1) {
        call[k] = local.x;
        call[k + 1] = local.y;
        bumpDraft();
      }
      return;
    }
    if (drag.kind === 'moveOpening') {
      const o = viewOpenings[drag.index];
      const span = o ? openingSpan(o, viewSections) : null;
      if (!o || !span) {
        return;
      }
      const along = span.axis === 'h' ? wx : wy;
      const next = beginDraftOpenings();
      next[drag.index] = clampOpening(
        { ...o, offset: along - drag.grab },
        viewSections
      );
      bumpDraft();
      return;
    }
    if (drag.kind === 'resizeOpening') {
      const o = viewOpenings[drag.index];
      const span = o ? openingSpan(o, viewSections) : null;
      if (!o || !span) {
        return;
      }
      const along = span.axis === 'h' ? wx : wy;
      const lo = Math.min(along, drag.fixed);
      const hi = Math.max(along, drag.fixed);
      const next = beginDraftOpenings();
      next[drag.index] = clampOpening(
        { ...o, offset: lo, width: Math.max(8, hi - lo) },
        viewSections
      );
      bumpDraft();
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;

    if (drag?.kind === 'pan') {
      if (camRaf.current) {
        cancelAnimationFrame(camRaf.current);
        camRaf.current = 0;
      }
      const camToCommit = pendingCam.current ?? liveCam;
      pendingCam.current = null;
      if (camToCommit) {
        onCam(camToCommit);
        setLiveCam(null);
      }
    }

    hideRectGhost();
    hideWallGhost();

    if (!drag) {
      return;
    }

    if (playing) {
      return;
    }

    if (
      drag.kind === 'move' ||
      drag.kind === 'resize' ||
      drag.kind === 'resizeField' ||
      drag.kind === 'rotateAim' ||
      drag.kind === 'moveCall' ||
      drag.kind === 'moveCallEnd' ||
      drag.kind === 'moveWall' ||
      drag.kind === 'moveWallEnd' ||
      drag.kind === 'moveOpening' ||
      drag.kind === 'resizeOpening'
    ) {
      commitDraft();
      return;
    }

    if (drag.kind === 'create') {
      const { wx, wy } = localPoint(e);
      const raw = normalizeRect(drag.x0, drag.y0, wx, wy);
      const snapped = snapRect(
        raw.x,
        raw.y,
        raw.w,
        raw.h,
        sections,
        { l: true, r: true, t: true, b: true },
        snapDist
      );
      const next = cloneSections(sections);
      next.push([snapped.x, snapped.y, snapped.w, snapped.h, []]);
      onSections(next);
      onSelection({ kind: 'section', index: next.length - 1 });
    }
    if (drag.kind === 'field') {
      const { wx, wy } = localPoint(e);
      const s = sections[drag.section];
      if (s) {
        const cur = toLocal(s, wx, wy);
        const p = clampLocal(s, cur.x, cur.y);
        const raw = normalizeFieldRect(drag.x0, drag.y0, p.x, p.y);
        const clamped = clampRectLocal(s, raw.x, raw.y, raw.w, raw.h);
        const next = cloneSections(sections);
        const call = placeDefaults(drag.id, clamped.x, clamped.y);
        call[3] = clamped.w;
        call[4] = clamped.h;
        next[drag.section][4].push(call);
        onSections(next);
        onSelection({
          kind: 'call',
          section: drag.section,
          call: next[drag.section][4].length - 1,
        });
        onTool({ kind: 'select' });
      }
    }
    if (drag.kind === 'wall') {
      const { wx, wy } = localPoint(e);
      const s = sections[drag.section];
      const raw = toLocal(s, wx, wy);
      let local = clampLocal(s, raw.x, raw.y);
      if (e.shiftKey) {
        const snapped = snapPolar(drag.x0, drag.y0, local.x, local.y);
        local = clampLocal(s, snapped.x, snapped.y);
      }
      if (Math.hypot(local.x - drag.x0, local.y - drag.y0) >= 2) {
        const next = cloneSections(sections);
        if (drag.id === B_PORTAL) {
          const call = placeDefaults(B_PORTAL, drag.x0, drag.y0);
          call[3] = local.x;
          call[4] = local.y;
          next[drag.section][4].push(call);
          onSections(next);
          onSelection({
            kind: 'call',
            section: drag.section,
            call: next[drag.section][4].length - 1,
          });
        } else if (isSegmentWallCall(drag.id)) {
          next[drag.section][4].push([
            drag.id,
            drag.x0,
            drag.y0,
            local.x,
            local.y,
            drag.id === B_WALL_RESTI ? 0.5 : 0,
          ]);
          onSections(next);
          onSelection({
            kind: 'wall',
            section: drag.section,
            call: next[drag.section][4].length - 1,
            segment: 0,
          });
        } else {
          const ci = ensureWallsCall(next[drag.section]);
          next[drag.section][4][ci].push(drag.x0, drag.y0, local.x, local.y);
          onSections(next);
          onSelection({
            kind: 'wall',
            section: drag.section,
            call: ci,
            segment: Math.floor((next[drag.section][4][ci].length - 5) / 4),
          });
        }
      }
    }
  };

  const selectedSection =
    selection && selection.kind === 'section' ? viewSections[selection.index] : null;

  let cursor = 'default';
  if (playing) {
    cursor = 'crosshair';
  } else if (tool.kind !== 'select') {
    cursor = 'crosshair';
  }

  let triggerWalls: Set<number> | null = null;
  let triggerWallSection = -1;
  let triggerParts: Set<number> | null = null;
  let triggerPartSection = -1;
  if (selection && selection.kind === 'call') {
    const call = viewSections[selection.section]?.[4][selection.call];
    if (call && (call[0] === B_FIELD || call[0] === B_COLLECTABLE)) {
      const trig = triggerDefFor(
        call[0] === B_COLLECTABLE ? TRIGGER_GATE_SECTION_4 : (call[5] ?? 0)
      );
      const walls = new Set<number>();
      const parts = new Set<number>();
      let wallSection = selection.section;
      let partSection = selection.section;
      for (let a = 0; a < trig.args.length; a++) {
        if (trig.args[a] === 'section') {
          wallSection = call[6 + a] ?? wallSection;
          partSection = call[6 + a] ?? partSection;
        }
      }
      for (let a = 0; a < trig.args.length; a++) {
        if (trig.args[a] === 'wall') {
          const wi = call[6 + a];
          if (wi >= 0) {
            walls.add(wi);
          }
        }
        if (trig.args[a] === 'part') {
          const pi = call[6 + a];
          if (pi >= 0) {
            parts.add(pi);
          }
        }
      }
      if (walls.size) {
        triggerWalls = walls;
        triggerWallSection = wallSection;
      }
      if (parts.size) {
        triggerParts = parts;
        triggerPartSection = partSection;
      }
    }
  }

  const viewLinks = useMemo(
    () => openingsToLinks(viewSections, viewOpenings),
    [viewSections, viewOpenings, draftRev, sections, openings]
  );

  return (
    <div
      ref={wrapRef}
      className="canvas-wrap"
      style={{ cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg key={playing ? 'play' : 'edit'}>
        <g transform={`scale(${viewCam.scale}) translate(${-viewCam.x} ${-viewCam.y})`}>
          {viewBuilt.map(section => (
            <SectionPreview
              key={section.id}
              section={section}
              selected={
                !!selection &&
                selection.kind === 'section' &&
                selection.index === section.id
              }
              highlightWalls={
                triggerWallSection === section.id ? triggerWalls : null
              }
              highlightParts={
                triggerPartSection === section.id ? triggerParts : null
              }
              restiWalls={
                viewSections[section.id]
                  ? restiWallIndices(viewSections[section.id], section.id, viewLinks)
                  : null
              }
            />
          ))}
          {showWallIds
            ? viewBuilt.map(section =>
                section.walls.map((w, i) => (
                  <text
                    key={'wi' + section.id + '-' + i}
                    x={(w.a.x + w.b.x) / 2 + section.x}
                    y={(w.a.y + w.b.y) / 2 + section.y}
                    fill="#fc8"
                    stroke="#000"
                    strokeWidth={3 / viewCam.scale}
                    paintOrder="stroke"
                    fontSize={12 / viewCam.scale}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {i}
                  </text>
                ))
              )
            : null}
          {showWallIds
            ? viewBuilt.map(section =>
                section.parts.map((part, i) => {
                  if (part.type !== PART_DECORATION) {
                    return null;
                  }
                  const p = decorationLightAt(part as Decoration, 0);
                  return (
                    <text
                      key={'pi' + section.id + '-' + i}
                      x={p.x + section.x}
                      y={p.y + section.y}
                      fill="#8cf"
                      stroke="#000"
                      strokeWidth={3 / viewCam.scale}
                      paintOrder="stroke"
                      fontSize={12 / viewCam.scale}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {i}
                    </text>
                  );
                })
              )
            : null}
          {viewOpenings.map((o, i) => {
            const span = openingSpan(o, viewSections);
            if (!span) {
              return null;
            }
            const selected = selection && selection.kind === 'opening' && selection.index === i;
            const hs = 5 / viewCam.scale;
            return (
              <g key={'o' + i}>
                <line
                  x1={span.axis === 'h' ? span.lo : span.pos}
                  y1={span.axis === 'h' ? span.pos : span.lo}
                  x2={span.axis === 'h' ? span.hi : span.pos}
                  y2={span.axis === 'h' ? span.pos : span.hi}
                  stroke={selected ? '#fc8' : '#6c8'}
                  strokeWidth={selected ? 10 : 8}
                  strokeLinecap="round"
                />
                {selected && !playing
                  ? (
                    <>
                      <rect
                        x={(span.axis === 'h' ? span.lo : span.pos) - hs}
                        y={(span.axis === 'h' ? span.pos : span.lo) - hs}
                        width={hs * 2}
                        height={hs * 2}
                        fill="#fff"
                        stroke="#000"
                        strokeWidth={1 / viewCam.scale}
                      />
                      <rect
                        x={(span.axis === 'h' ? span.hi : span.pos) - hs}
                        y={(span.axis === 'h' ? span.pos : span.hi) - hs}
                        width={hs * 2}
                        height={hs * 2}
                        fill="#fff"
                        stroke="#000"
                        strokeWidth={1 / viewCam.scale}
                      />
                    </>
                  )
                  : null}
              </g>
            );
          })}
          {tool.kind === 'opening'
            ? sharedEdgeGuides(viewSections)
            : null}
          <rect
            ref={rectGhostRef}
            fill="rgba(120,180,255,0.15)"
            stroke="#8cf"
            strokeWidth={2}
            strokeDasharray="6 4"
            style={{ display: 'none' }}
            pointerEvents="none"
          />
          <line
            ref={wallGhostRef}
            stroke="#fc8"
            strokeWidth={4}
            style={{ display: 'none' }}
            pointerEvents="none"
          />
          {selection && selection.kind === 'call'
            ? callMarker(viewSections, selection.section, selection.call, viewCam.scale)
            : null}
          {selection &&
          selection.kind === 'call' &&
          !playing &&
          viewSections[selection.section] &&
          viewSections[selection.section][4][selection.call] &&
          isRectBuilder(viewSections[selection.section][4][selection.call][0])
            ? fieldCorners(
                fieldWorld(
                  viewSections[selection.section],
                  viewSections[selection.section][4][selection.call]
                )
              ).map(h => (
                <rect
                  key={h.id}
                  x={h.x - 5 / viewCam.scale}
                  y={h.y - 5 / viewCam.scale}
                  width={10 / viewCam.scale}
                  height={10 / viewCam.scale}
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={1 / viewCam.scale}
                />
              ))
            : null}
          {selection && selection.kind === 'wall'
            ? wallMarker(viewSections, selection, viewCam.scale)
            : null}
          {selectedSection && !playing
            ? handlePositions(selectedSection).map(h => (
                <rect
                  key={h.id}
                  x={h.x - 5 / viewCam.scale}
                  y={h.y - 5 / viewCam.scale}
                  width={10 / viewCam.scale}
                  height={10 / viewCam.scale}
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={1 / viewCam.scale}
                />
              ))
            : null}
          {sim
            ? sim.balls.map((ball, i) => (
                <circle
                  key={'ball' + i}
                  data-live="ball"
                  cx={ball.pos.x}
                  cy={ball.pos.y}
                  r={ball.r}
                  fill={ball.color}
                  fillOpacity={0.75}
                />
              ))
            : null}
          {spawn ? (
            <g
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={2 / viewCam.scale}
              strokeLinecap="round"
            >
              <line
                x1={spawn.x - 7 / viewCam.scale}
                y1={spawn.y - 7 / viewCam.scale}
                x2={spawn.x + 7 / viewCam.scale}
                y2={spawn.y + 7 / viewCam.scale}
              />
              <line
                x1={spawn.x + 7 / viewCam.scale}
                y1={spawn.y - 7 / viewCam.scale}
                x2={spawn.x - 7 / viewCam.scale}
                y2={spawn.y + 7 / viewCam.scale}
              />
            </g>
          ) : null}
        </g>
      </svg>
      <div className="hint">
        {playing
          ? 'Click to drop the ball. Middle-drag pans. R resets. Esc stops. Z / ← left flipper, / / → right, Space launch. Wheel zooms.'
          : 'Space plays, Esc stops. Middle-drag pan, wheel zoom. C clones the selected builder at the cursor. Shift locks wall angle (15°).'}
      </div>
    </div>
  );
};

const sharedEdgeGuides = (sections: SectionData[]) => {
  const lines = [];
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const share = sharedBoundary(sections[i], sections[j]);
      if (!share) {
        continue;
      }
      lines.push(
        <line
          key={`g${i}-${j}`}
          x1={share.axis === 'h' ? share.lo : share.pos}
          y1={share.axis === 'h' ? share.pos : share.lo}
          x2={share.axis === 'h' ? share.hi : share.pos}
          y2={share.axis === 'h' ? share.pos : share.hi}
          stroke="#fc8"
          strokeWidth={3}
          strokeDasharray="8 6"
        />
      );
    }
  }
  return lines;
};

const callMarker = (
  sections: SectionData[],
  si: number,
  ci: number,
  scale: number
) => {
  const s = sections[si];
  const call = s && s[4][ci];
  if (!call || call.length < 3) {
    return null;
  }
  const origin = callOrigin(s, call);
  const segment = callVisualSegment(s, call);
  const up =
    call[0] === B_FLIPPER_LEFT
      ? paddleRay(
          origin,
          flipperPose(call).up,
          call[6] > 0 ? call[6] : PADDLE_LEN
        )
      : null;
  const hs = 5 / scale;
  return (
    <g>
      {up ? (
        <line
          x1={up.x0}
          y1={up.y0}
          x2={up.x1}
          y2={up.y1}
          stroke="#8cf"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${8 / scale} ${6 / scale}`}
        />
      ) : null}
      {isRectBuilder(call[0]) ? (
        <rect
          x={origin.x}
          y={origin.y}
          width={call[3]}
          height={call[4]}
          fill="none"
          stroke="#fc8"
          strokeWidth={2 / scale}
        />
      ) : null}
      {isDecRainbow(call) && call.length >= 9 ? (
        <rect
          x={origin.x}
          y={origin.y}
          width={call[7]}
          height={call[8]}
          fill="none"
          stroke="#fc8"
          strokeWidth={2 / scale}
        />
      ) : null}
      {call[0] === B_CONVEYER
        ? (() => {
            const arrow = conveyerArrowWorld(s, call);
            const tip = 5 / scale;
            const ca = Math.cos(arrow.angle);
            const sa = Math.sin(arrow.angle);
            return (
              <g>
                {conveyerArrowMarks(
                  arrow.cx,
                  arrow.cy,
                  ca,
                  sa,
                  CONVEYER_ARROW_LEN,
                  '#fc8',
                  4 / scale
                )}
                <circle
                  cx={arrow.x1}
                  cy={arrow.y1}
                  r={tip}
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={1 / scale}
                />
              </g>
            );
          })()
        : null}
      {segment ? (
        <line
          x1={segment.x0}
          y1={segment.y0}
          x2={segment.x1}
          y2={segment.y1}
          stroke="#fc8"
          strokeWidth={8}
          strokeLinecap="round"
        />
      ) : null}
      {call[0] === B_LAUNCHER && segment ? (
        <circle
          cx={segment.x1}
          cy={segment.y1}
          r={5 / scale}
          fill="#fff"
          stroke="#000"
          strokeWidth={1 / scale}
        />
      ) : null}
      {call[0] === B_TRIANGLE && call.length >= 6
        ? (() => {
            const t = triangleWorld(s, call);
            const tip = 5 / scale;
            return (
              <g>
                <line
                  x1={t.x0}
                  y1={t.y0}
                  x2={t.x1}
                  y2={t.y1}
                  stroke="#fc8"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <line
                  x1={t.x0}
                  y1={t.y0}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="#fc8"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke="#fc8"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <circle
                  cx={t.x1}
                  cy={t.y1}
                  r={tip}
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={1 / scale}
                />
              </g>
            );
          })()
        : null}
      {call[0] === B_DECORATION
        ? (() => {
            const tip = decorationTipWorld(s, call);
            const r = 5 / scale;
            return (
              <g>
                <line
                  x1={tip.ox}
                  y1={tip.oy}
                  x2={tip.x}
                  y2={tip.y}
                  stroke="#fc8"
                  strokeWidth={2 / scale}
                  strokeLinecap="round"
                />
                <circle
                  cx={tip.x}
                  cy={tip.y}
                  r={r}
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={1 / scale}
                />
              </g>
            );
          })()
        : null}
      {!isRectBuilder(call[0]) && call[0] !== B_LAUNCHER ? (
        <rect
          x={origin.x - hs}
          y={origin.y - hs}
          width={hs * 2}
          height={hs * 2}
          fill="#fff"
          stroke="#000"
          strokeWidth={1 / scale}
        />
      ) : null}
      {call[0] === B_PORTAL && call.length >= 5 ? (
        <rect
          x={s[0] + call[3] - hs}
          y={s[1] + call[4] - hs}
          width={hs * 2}
          height={hs * 2}
          fill="#fff"
          stroke="#000"
          strokeWidth={1 / scale}
        />
      ) : null}
      {isDecLightLine(call) && call.length >= 12 ? (
        <rect
          x={s[0] + call[10] - hs}
          y={s[1] + call[11] - hs}
          width={hs * 2}
          height={hs * 2}
          fill="#fff"
          stroke="#000"
          strokeWidth={1 / scale}
        />
      ) : null}
    </g>
  );
};

const wallMarker = (
  sections: SectionData[],
  selection: { section: number; call: number; segment: number },
  scale: number
) => {
  const s = sections[selection.section];
  const call = s && s[4][selection.call];
  if (!call) {
    return null;
  }
  const k = 1 + selection.segment * 4;
  const x0 = s[0] + call[k];
  const y0 = s[1] + call[k + 1];
  const x1 = s[0] + call[k + 2];
  const y1 = s[1] + call[k + 3];
  const hs = 5 / scale;
  return (
    <g>
      <line
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke="#fc8"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <rect
        x={x0 - hs}
        y={y0 - hs}
        width={hs * 2}
        height={hs * 2}
        fill="#fff"
        stroke="#000"
        strokeWidth={1 / scale}
      />
      <rect
        x={x1 - hs}
        y={y1 - hs}
        width={hs * 2}
        height={hs * 2}
        fill="#fff"
        stroke="#000"
        strokeWidth={1 / scale}
      />
    </g>
  );
};

const SectionPreview = memo(({
  section,
  selected,
  highlightWalls,
  highlightParts,
  restiWalls,
}: {
  section: Section;
  selected: boolean;
  highlightWalls: Set<number> | null;
  highlightParts: Set<number> | null;
  restiWalls: Set<number> | null;
}) => {
  return (
    <g transform={`translate(${section.x} ${section.y})`}>
      <foreignObject
        width={section.w}
        height={section.h}
        pointerEvents="none"
      >
        <div
          className="sb"
          style={{ width: section.w, height: section.h }}
        />
      </foreignObject>
      <rect
        width={section.w}
        height={section.h}
        fill="none"
        stroke={selected ? '#fff' : 'none'}
        strokeWidth={selected ? 3 : 0}
      />
      <text x={8} y={18} fill="#fff" fontSize={14} fontWeight="bold">
        {section.id}
      </text>
      {section.fills.map((f, i) => (
        <path
          key={'f' + i}
          d={
            'M' +
            f[0] +
            ' ' +
            f[1] +
            'L' +
            f[2] +
            ' ' +
            f[3] +
            'L' +
            f[4] +
            ' ' +
            f[5] +
            'Z'
          }
          fill={GATE_COLORS[(f[6] | 0) % GATE_COLORS.length]}
        />
      ))}
      {section.walls.map((w, i) => {
        const lit = highlightWalls && highlightWalls.has(i);
        const resti = restiWalls && restiWalls.has(i);
        const gate = w.color >= 0;
        const gateStroke =
          GATE_COLORS[w.color % GATE_COLORS.length] || '#fc8';
        return (
          <line
            key={'w' + i}
            data-live="wall"
            data-s={section.id}
            data-i={i}
            x1={w.a.x}
            y1={w.a.y}
            x2={w.b.x}
            y2={w.b.y}
            stroke={
              lit
                ? '#fc8'
                : w.rest < 0
                  ? 'rgba(136,136,136,0.2)'
                  : gate
                    ? gateStroke
                    : resti
                      ? '#fff'
                      : '#888'
            }
            strokeWidth={lit ? 7 : gate ? 6 : 4}
            strokeDasharray={gate && !lit ? '10 6' : undefined}
            strokeLinecap="round"
          />
        );
      })}
      {section.parts.map((part, i) => (
        <PartPreview key={'p' + i} part={part} sectionId={section.id} index={i} />
      ))}
      {highlightParts
        ? section.parts.map((part, i) => {
            if (!highlightParts.has(i) || part.type !== PART_DECORATION) {
              return null;
            }
            const dec = part as Decoration;
            const n = decorationLightCount(dec);
            const marks = [];
            for (let k = 0; k < n; k++) {
              const p = decorationLightAt(dec, k);
              marks.push(
                <circle
                  key={k}
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill="none"
                  stroke="#fc8"
                  strokeWidth={3}
                />
              );
            }
            return <g key={'hp' + i}>{marks}</g>;
          })
        : null}
    </g>
  );
});

const conveyerArrowMarks = (
  cx: number,
  cy: number,
  ca: number,
  sa: number,
  len: number,
  stroke: string,
  strokeWidth: number
) => {
  const tipX = cx + ca * len;
  const tipY = cy + sa * len;
  const head = Math.max(8, len * 0.35);
  const bx = tipX - ca * head;
  const by = tipY - sa * head;
  const pxOff = -sa * head * 0.65;
  const pyOff = ca * head * 0.65;
  return (
    <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
      <line x1={cx - ca * len} y1={cy - sa * len} x2={tipX} y2={tipY} />
      <line x1={tipX} y1={tipY} x2={bx + pxOff} y2={by + pyOff} />
      <line x1={tipX} y1={tipY} x2={bx - pxOff} y2={by - pyOff} />
    </g>
  );
};

const PartPreview = ({
  part,
  sectionId,
  index,
}: {
  part: Section['parts'][number];
  sectionId: number;
  index: number;
}) => {
  if (part.type === PART_PORTAL) {
    const portal = part as Portal;
    const fill = GATE_COLORS[portal.color] || GATE_COLORS[0];
    const rx = portal.r * 0.55;
    const ry = portal.r;
    const mouths = [
      { x: portal.x, y: portal.y },
      { x: portal.x2, y: portal.y2 },
    ];
    const deg = (portal.angle * 180) / Math.PI;
    let spiral = '';
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 5;
      const r = (i / steps) * rx * 0.85;
      spiral +=
        (i ? 'L' : 'M') + Math.cos(t) * r + ' ' + Math.sin(t) * r;
    }
    return (
      <g>
        <line
          x1={portal.x}
          y1={portal.y}
          x2={portal.x2}
          y2={portal.y2}
          stroke={fill}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
        {mouths.map((m, i) => (
          <g key={i} transform={`translate(${m.x} ${m.y})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={rx}
              ry={ry}
              fill={fill}
              stroke="#fff"
              strokeWidth={2}
            />
            <g data-live="portal" data-s={sectionId} data-i={index} transform={`rotate(${deg})`}>
              <path
                d={spiral}
                fill="none"
                stroke="#000"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </g>
          </g>
        ))}
      </g>
    );
  }
  if (part.type === PART_COLLECTABLE) {
    const coin = part as Collectable;
    return (
      <circle
        data-live="coin"
        data-s={sectionId}
        data-i={index}
        cx={coin.x}
        cy={coin.y}
        r={coin.r}
        fill="#fc8"
        stroke="#a80"
        strokeWidth={2}
        style={coin.taken ? { display: 'none' } : undefined}
      />
    );
  }
  if (part.type === PART_DECORATION) {
    const dec = part as Decoration;
    const rot = (dec.rot * 180) / Math.PI;
    if (dec.decorationType === DEC_RAINBOW) {
      return (
        <foreignObject
          x={dec.x}
          y={dec.y}
          width={dec.x1}
          height={dec.y1}
          overflow="hidden"
          transform={`rotate(${rot} ${dec.x} ${dec.y})`}
        >
          <div className="tr" style={{ width: '100%', height: '100%' }} />
        </foreignObject>
      );
    }
    if (dec.decorationType === DEC_ICON) {
      const fill = decorationFill(dec.texture);
      return (
        <g
          transform={`translate(${dec.x} ${dec.y}) rotate(${rot}) scale(${dec.scale})`}
          opacity={dec.opacity}
        >
          <path d={STAR_D} fill={fill} transform="scale(9)" />
        </g>
      );
    }
    const n = decorationLightCount(dec);
    const lights = [];
    for (let i = 0; i < n; i++) {
      const p = decorationLightAt(dec, i);
      lights.push(
        <g
          key={i}
          className={getTextureClass(dec.texture)}
          style={{
            animation: lightAnimation(dec),
            animationDelay: i * dec.delay + 'ms',
          }}
          transform={`translate(${p.x} ${p.y}) rotate(${rot}) scale(${dec.scale})`}
        >
          {dec.shape === SHAPE_CIRCLE ? (
            <circle r={8} fill="none" strokeWidth={3} />
          ) : dec.shape === SHAPE_SQUARE ? (
            <rect
              x={-8}
              y={-8}
              width={16}
              height={16}
              fill="none"
              strokeWidth={3}
            />
          ) : (
            <path
              d={CHEVRON_D}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      );
    }
    return (
      <g
        data-live="light"
        data-s={sectionId}
        data-i={index}
        data-on={dec.active ? '1' : '0'}
        opacity={dec.active ? 1 : 0.2}
      >
        {lights}
      </g>
    );
  }
  if (part.type === PART_FIELD) {
    const field = part as Field;
    const conveyer = !field.trigger && field.grav === 0;
    const forceLen = Math.hypot(field.ax, field.ay);
    if (conveyer && forceLen > 0) {
      const deg = (Math.atan2(field.ay, field.ax) * 180) / Math.PI;
      return (
        <foreignObject
          x={field.x}
          y={field.y}
          width={field.w}
          height={field.h}
          overflow="hidden"
        >
          <div
            className={getTextureClass(TEX_ARROWS)}
            style={{
              width: '100%',
              height: '100%',
              ['--r' as string]: deg + 'deg',
            }}
          />
        </foreignObject>
      );
    }
    const fill = field.inside
      ? 'rgba(120,200,255,0.35)'
      : 'rgba(70,140,220,0.18)';
    return (
      <rect
        data-live="field"
        data-s={sectionId}
        data-i={index}
        x={field.x}
        y={field.y}
        width={field.w}
        height={field.h}
        fill={fill}
      />
    );
  }
  if (part.type === PART_PADDLE) {
    const paddle = part as Paddle;
    const line = paddle.getLine();
    return (
      <line
        data-live="paddle"
        data-s={sectionId}
        data-i={index}
        x1={line.a.x}
        y1={line.a.y}
        x2={line.b.x}
        y2={line.b.y}
        stroke="#ccc"
        strokeWidth={6}
        strokeLinecap="round"
      />
    );
  }
  if (part.type === PART_LAUNCHER) {
    const launcher = part as Launcher;
    const len = launcher.len;
    const t = launcher.getChargeT();
    const fill = len * t;
    return (
      <g>
        <line
          x1={launcher.x}
          y1={launcher.y}
          x2={launcher.x - launcher.dir.x * len}
          y2={launcher.y - launcher.dir.y * len}
          stroke="#c84"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <line
          data-live="launcher"
          data-s={sectionId}
          data-i={index}
          x1={launcher.x}
          y1={launcher.y}
          x2={launcher.x - launcher.dir.x * fill}
          y2={launcher.y - launcher.dir.y * fill}
          stroke={t >= 1 ? '#fc8' : '#fa6'}
          strokeWidth={8}
          strokeLinecap="round"
        />
      </g>
    );
  }
  const obstacle = part as Obstacle;
  const glyph =
    obstacle.isCircle ? (
      <>
        <circle r={obstacle.r} fill={circleFill(obstacle.active, obstacle.color)} />
        <g transform={`scale(${obstacle.r * 0.7})`}>
          {obstacle.icon === CIRCLE_DIAMOND ? (
            <path d={DIAMOND_D} fill="#123" />
          ) : (
            <>
              <circle cx={-0.32} cy={-0.22} r={0.13} fill="#123" />
              <circle cx={0.32} cy={-0.22} r={0.13} fill="#123" />
              <path
                d="M-.4.22A.48.48 0 0 0 .4.22"
                fill="none"
                stroke="#123"
                strokeWidth={0.12}
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      </>
    ) : null;
  return (
    <g
      data-live="obstacle"
      data-s={sectionId}
      data-i={index}
      transform={`translate(${obstacle.x} ${obstacle.y}) rotate(${(obstacle.angle * 180) / Math.PI})`}
    >
      {glyph}
      {obstacle.walls.map((w, i) => {
        return (
          <line
            key={i}
            x1={w.a.x}
            y1={w.a.y}
            x2={w.b.x}
            y2={w.b.y}
            stroke={obstacleStroke(obstacle)}
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
