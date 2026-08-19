import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { B_CIRCLE, B_FLIPPER_LEFT, B_LAUNCHER, B_WALLS } from '@game/model/builders';
import {
  PART_FIELD,
  PART_LAUNCHER,
  PART_PADDLE,
} from '@game/model/Part';
import {
  PADDLE_LEN,
} from '@game/model/constants';
import type { Field } from '@game/model/parts/Field';
import type { Launcher } from '@game/model/parts/Launcher';
import type { Obstacle } from '@game/model/parts/Obstacle';
import type { Paddle } from '@game/model/parts/Paddle';
import type { Section } from '@game/model/Section';
import type { State } from '@game/state/State';
import {
  applyHandle,
  clampDeltaInRect,
  clampLocal,
  cloneSections,
  distToSegment,
  findSectionAt,
  findSharedEdgeAt,
  HANDLE_LIVE,
  handlePositions,
  normalizeRect,
  px,
  sharedBoundary,
  snapPolar,
  snapRect,
  SNAP_PX,
  toLocal,
  type Handle,
} from '../geometry';
import {
  clampOpening,
  DEFAULT_OPENING_WIDTH,
  openingSpan,
} from '../openings';
import { placeDefaults } from '../schema';
import type { Cam, Opening, SectionData, Selection, Tool } from '../types';

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
  | { kind: 'wall'; section: number; x0: number; y0: number }
  | {
      kind: 'moveCall';
      section: number;
      call: number;
      ox: number;
      oy: number;
      x0: number;
      y0: number;
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
  onCam: (cam: Cam) => void;
  onDropBall: (x: number, y: number) => void;
  onViewport: (w: number, h: number) => void;
  onCursor: (x: number, y: number) => void;
};

const LAUNCHER_LEN = 24;

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
  angle: number
) => {
  return {
    x0: origin.x,
    y0: origin.y,
    x1: origin.x + PADDLE_LEN * Math.cos(angle),
    y1: origin.y + PADDLE_LEN * Math.sin(angle),
  };
};

const callVisualSegment = (section: SectionData, call: number[]) => {
  const origin = callOrigin(section, call);
  if (call[0] === B_FLIPPER_LEFT) {
    return paddleRay(origin, flipperPose(call).rest);
  }
  if (call[0] === B_LAUNCHER) {
    const dx = call[3];
    const dy = call[4];
    const len = Math.hypot(dx, dy) || 1;
    return {
      x0: origin.x,
      y0: origin.y,
      x1: origin.x - (dx / len) * LAUNCHER_LEN,
      y1: origin.y - (dy / len) * LAUNCHER_LEN,
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
  const segment = callVisualSegment(section, call);
  if (segment) {
    if (distToSegment(wx, wy, segment.x0, segment.y0, segment.x1, segment.y1) < fat) {
      return true;
    }
    if (call[0] === B_FLIPPER_LEFT) {
      const up = paddleRay(origin, flipperPose(call).up);
      if (distToSegment(wx, wy, up.x0, up.y0, up.x1, up.y1) < fat) {
        return true;
      }
    }
    return false;
  }
  if (call[0] === B_CIRCLE) {
    const r = call[5];
    return Math.hypot(wx - origin.x, wy - origin.y) < r + slop;
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
    const calls = s[5];
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
  const c = s && s[5][call];
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

const ensureWallsCall = (section: SectionData) => {
  for (let i = 0; i < section[5].length; i++) {
    if (section[5][i][0] === B_WALLS) {
      return i;
    }
  }
  section[5].unshift([B_WALLS]);
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
  onCam,
  onDropBall,
  onViewport,
  onCursor,
}: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [ghost, setGhost] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [wallGhost, setWallGhost] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const spaceRef = useRef(false);
  const [space, setSpace] = useState(false);

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
      if (e.code === 'Space') {
        spaceRef.current = true;
        setSpace(true);
        if (!playing) {
          e.preventDefault();
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceRef.current = false;
        setSpace(false);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
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
      const wx = cam.x + sx / cam.scale;
      const wy = cam.y + sy / cam.scale;
      const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      const scale = Math.max(0.15, Math.min(4, cam.scale * factor));
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
  }, [cam, onCam]);

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
      wx: cam.x + sx / cam.scale,
      wy: cam.y + sy / cam.scale,
    };
  };

  const snapDist = SNAP_PX / cam.scale;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const { sx, sy, wx, wy } = localPoint(e);
    onCursor(wx, wy);
    if (playing) {
      if (e.button === 0) {
        onDropBall(wx, wy);
      }
      return;
    }
    if (e.button === 1 || spaceRef.current) {
      dragRef.current = { kind: 'pan', lx: e.clientX, ly: e.clientY };
      return;
    }
    if (e.button !== 0) {
      return;
    }

    if (tool.kind === 'section') {
      dragRef.current = { kind: 'create', x0: wx, y0: wy };
      setGhost(normalizeRect(wx, wy, wx, wy));
      return;
    }

    if (tool.kind === 'opening') {
      const existing = hitTest(
        sections,
        openings,
        wx,
        wy,
        Math.max(4, 8 / cam.scale)
      );
      if (existing && existing.kind === 'opening') {
        const o = openings[existing.index];
        const span = openingSpan(o, sections);
        onSelection(existing);
        if (span) {
          const along = span.axis === 'h' ? wx : wy;
          dragRef.current = {
            kind: 'moveOpening',
            index: existing.index,
            grab: along - o.offset,
          };
        }
        return;
      }
      const hit = findSharedEdgeAt(sections, wx, wy, snapDist * 2);
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
          sections
        );
        const next = openings.filter(o => {
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
      const si = findSectionAt(sections, wx, wy);
      if (si < 0) {
        return;
      }
      const raw = toLocal(sections[si], wx, wy);
      const local = clampLocal(sections[si], raw.x, raw.y);
      if (tool.id === B_WALLS) {
        dragRef.current = { kind: 'wall', section: si, x0: local.x, y0: local.y };
        setWallGhost({ x0: wx, y0: wy, x1: wx, y1: wy });
        return;
      }
      const next = cloneSections(sections);
      next[si][5].push(placeDefaults(tool.id, local.x, local.y));
      onSections(next);
      onSelection({ kind: 'call', section: si, call: next[si][5].length - 1 });
      return;
    }

    if (selection && selection.kind === 'section') {
      const section = sections[selection.index];
      if (section) {
        const handle = hitHandle(section, sx, sy, cam);
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
              section[5],
            ],
          };
          return;
        }
      }
    }

    if (selection && selection.kind === 'wall') {
      const end = hitWallEnd(sections, selection, sx, sy, cam);
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

    const hit = hitTest(sections, openings, wx, wy, Math.max(4, 8 / cam.scale));
    onSelection(hit);
    if (hit && hit.kind === 'section') {
      dragRef.current = {
        kind: 'move',
        index: hit.index,
        x0: wx,
        y0: wy,
        ox: sections[hit.index][0],
        oy: sections[hit.index][1],
      };
    }
    if (hit && hit.kind === 'call') {
      const call = sections[hit.section][5][hit.call];
      if (call && call[0] !== B_WALLS && call.length >= 3) {
        dragRef.current = {
          kind: 'moveCall',
          section: hit.section,
          call: hit.call,
          ox: call[1],
          oy: call[2],
          x0: wx,
          y0: wy,
        };
      }
    }
    if (hit && hit.kind === 'wall') {
      const call = sections[hit.section][5][hit.call];
      const k = 1 + hit.segment * 4;
      if (call && call.length >= k + 4) {
        const end = hitWallEnd(sections, hit, sx, sy, cam);
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
      const o = openings[hit.index];
      const span = openingSpan(o, sections);
      if (o && span) {
        const along = span.axis === 'h' ? wx : wy;
        dragRef.current = {
          kind: 'moveOpening',
          index: hit.index,
          grab: along - o.offset,
        };
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
      onCam({
        ...cam,
        x: cam.x - (e.clientX - drag.lx) / cam.scale,
        y: cam.y - (e.clientY - drag.ly) / cam.scale,
      });
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      return;
    }
    if (drag.kind === 'create') {
      const others = sections;
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
      setGhost(snapped);
      return;
    }
    if (drag.kind === 'move') {
      const others = sections.filter((_, i) => i !== drag.index);
      const s = sections[drag.index];
      const snapped = snapRect(
        drag.ox + (wx - drag.x0),
        drag.oy + (wy - drag.y0),
        s[2],
        s[3],
        others,
        { l: true, r: true, t: true, b: true },
        snapDist
      );
      const next = cloneSections(sections);
      next[drag.index][0] = snapped.x;
      next[drag.index][1] = snapped.y;
      onSections(next);
      onOpenings(openings.map(o => clampOpening(o, next)));
      return;
    }
    if (drag.kind === 'resize') {
      const others = sections.filter((_, i) => i !== drag.index);
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
      const next = cloneSections(sections);
      next[drag.index][0] = snapped.x;
      next[drag.index][1] = snapped.y;
      next[drag.index][2] = snapped.w;
      next[drag.index][3] = snapped.h;
      onSections(next);
      onOpenings(openings.map(o => clampOpening(o, next)));
      return;
    }
    if (drag.kind === 'wall') {
      const s = sections[drag.section];
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
      setWallGhost({
        x0: sections[drag.section][0] + drag.x0,
        y0: sections[drag.section][1] + drag.y0,
        x1,
        y1,
      });
    }
    if (drag.kind === 'moveCall') {
      const s = sections[drag.section];
      if (!s) {
        return;
      }
      const local = clampLocal(
        s,
        drag.ox + (wx - drag.x0),
        drag.oy + (wy - drag.y0)
      );
      const next = cloneSections(sections);
      const call = next[drag.section][5][drag.call];
      if (call && call.length >= 3) {
        call[1] = local.x;
        call[2] = local.y;
        onSections(next);
      }
      return;
    }
    if (drag.kind === 'moveWall') {
      const s = sections[drag.section];
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
      const next = cloneSections(sections);
      const call = next[drag.section][5][drag.call];
      const k = 1 + drag.segment * 4;
      if (call && call.length >= k + 4) {
        call[k] = px(drag.ox0 + shifted.dx);
        call[k + 1] = px(drag.oy0 + shifted.dy);
        call[k + 2] = px(drag.ox1 + shifted.dx);
        call[k + 3] = px(drag.oy1 + shifted.dy);
        onSections(next);
      }
      return;
    }
    if (drag.kind === 'moveWallEnd') {
      const s = sections[drag.section];
      if (!s) {
        return;
      }
      const raw = toLocal(s, wx, wy);
      let local = clampLocal(s, raw.x, raw.y);
      if (e.shiftKey) {
        const src = s[5][drag.call];
        const base = 1 + drag.segment * 4;
        const other = 1 - drag.end;
        const ox = src[base + other * 2];
        const oy = src[base + other * 2 + 1];
        const snapped = snapPolar(ox, oy, local.x, local.y);
        local = clampLocal(s, snapped.x, snapped.y);
      }
      const next = cloneSections(sections);
      const call = next[drag.section][5][drag.call];
      const k = 1 + drag.segment * 4 + drag.end * 2;
      if (call && call.length > k + 1) {
        call[k] = local.x;
        call[k + 1] = local.y;
        onSections(next);
      }
      return;
    }
    if (drag.kind === 'moveOpening') {
      const o = openings[drag.index];
      const span = o ? openingSpan(o, sections) : null;
      if (!o || !span) {
        return;
      }
      const along = span.axis === 'h' ? wx : wy;
      const next = openings.slice();
      next[drag.index] = clampOpening(
        { ...o, offset: along - drag.grab },
        sections
      );
      onOpenings(next);
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (playing || !drag) {
      setGhost(null);
      setWallGhost(null);
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
      next.push([snapped.x, snapped.y, snapped.w, snapped.h, 0, []]);
      onSections(next);
      onSelection({ kind: 'section', index: next.length - 1 });
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
        const ci = ensureWallsCall(next[drag.section]);
        next[drag.section][5][ci].push(drag.x0, drag.y0, local.x, local.y);
        onSections(next);
        onSelection({
          kind: 'wall',
          section: drag.section,
          call: ci,
          segment: Math.floor((next[drag.section][5][ci].length - 5) / 4),
        });
      }
    }
    setGhost(null);
    setWallGhost(null);
  };

  const selectedSection =
    selection && selection.kind === 'section' ? sections[selection.index] : null;

  let cursor = 'default';
  if (playing) {
    cursor = 'crosshair';
  } else if (space) {
    cursor = 'grab';
  } else if (tool.kind !== 'select') {
    cursor = 'crosshair';
  }

  return (
    <div
      ref={wrapRef}
      className="canvas-wrap"
      style={{ cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg>
        <g transform={`scale(${cam.scale}) translate(${-cam.x} ${-cam.y})`}>
          {built.map(section => (
            <SectionPreview
              key={section.id}
              section={section}
              selected={
                !!selection &&
                selection.kind === 'section' &&
                selection.index === section.id
              }
            />
          ))}
          {openings.map((o, i) => {
            const span = openingSpan(o, sections);
            if (!span) {
              return null;
            }
            const selected = selection && selection.kind === 'opening' && selection.index === i;
            return (
              <line
                key={'o' + i}
                x1={span.axis === 'h' ? span.lo : span.pos}
                y1={span.axis === 'h' ? span.pos : span.lo}
                x2={span.axis === 'h' ? span.hi : span.pos}
                y2={span.axis === 'h' ? span.pos : span.hi}
                stroke={selected ? '#fc8' : '#6c8'}
                strokeWidth={selected ? 10 : 8}
                strokeLinecap="round"
              />
            );
          })}
          {tool.kind === 'opening'
            ? sharedEdgeGuides(sections)
            : null}
          {ghost ? (
            <rect
              x={ghost.x}
              y={ghost.y}
              width={ghost.w}
              height={ghost.h}
              fill="rgba(120,180,255,0.15)"
              stroke="#8cf"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ) : null}
          {wallGhost ? (
            <line
              x1={wallGhost.x0}
              y1={wallGhost.y0}
              x2={wallGhost.x1}
              y2={wallGhost.y1}
              stroke="#fc8"
              strokeWidth={4}
            />
          ) : null}
          {selection && selection.kind === 'call'
            ? callMarker(sections, selection.section, selection.call, cam.scale)
            : null}
          {selection && selection.kind === 'wall'
            ? wallMarker(sections, selection, cam.scale)
            : null}
          {selectedSection && !playing
            ? handlePositions(selectedSection).map(h => (
                <rect
                  key={h.id}
                  x={h.x - 5 / cam.scale}
                  y={h.y - 5 / cam.scale}
                  width={10 / cam.scale}
                  height={10 / cam.scale}
                  fill="#fff"
                  stroke="#000"
                  strokeWidth={1 / cam.scale}
                />
              ))
            : null}
          {sim
            ? sim.balls.map((ball, i) => (
                <circle
                  key={'ball' + i}
                  cx={ball.pos.x}
                  cy={ball.pos.y}
                  r={ball.r}
                  fill={ball.color}
                />
              ))
            : null}
          {spawn ? (
            <g
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={2 / cam.scale}
              strokeLinecap="round"
            >
              <line
                x1={spawn.x - 7 / cam.scale}
                y1={spawn.y - 7 / cam.scale}
                x2={spawn.x + 7 / cam.scale}
                y2={spawn.y + 7 / cam.scale}
              />
              <line
                x1={spawn.x + 7 / cam.scale}
                y1={spawn.y - 7 / cam.scale}
                x2={spawn.x - 7 / cam.scale}
                y2={spawn.y + 7 / cam.scale}
              />
            </g>
          ) : null}
        </g>
      </svg>
      <div className="hint">
        {playing
          ? 'Click to drop the ball. Z / ← left flipper, / / → right, Space launch. Wheel zooms.'
          : 'Space-drag pan, wheel zoom. C clones the selected builder at the cursor. Shift locks wall angle (15°).'}
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
  const call = s && s[5][ci];
  if (!call || call.length < 3) {
    return null;
  }
  const origin = callOrigin(s, call);
  const segment = callVisualSegment(s, call);
  const up =
    call[0] === B_FLIPPER_LEFT
      ? paddleRay(origin, flipperPose(call).up)
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
      <rect
        x={origin.x - hs}
        y={origin.y - hs}
        width={hs * 2}
        height={hs * 2}
        fill="#fff"
        stroke="#000"
        strokeWidth={1 / scale}
      />
    </g>
  );
};

const wallMarker = (
  sections: SectionData[],
  selection: { section: number; call: number; segment: number },
  scale: number
) => {
  const s = sections[selection.section];
  const call = s && s[5][selection.call];
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

const SectionPreview = ({
  section,
  selected,
}: {
  section: Section;
  selected: boolean;
}) => {
  return (
    <g transform={`translate(${section.x} ${section.y})`}>
      <rect
        width={section.w}
        height={section.h}
        fill={section.bg}
        stroke={selected ? '#fff' : 'none'}
        strokeWidth={selected ? 3 : 0}
      />
      <text x={8} y={18} fill="#fff" fontSize={14} fontWeight="bold">
        {section.id}
      </text>
      {section.walls.map((w, i) => (
        <line
          key={'w' + i}
          x1={w.a.x}
          y1={w.a.y}
          x2={w.b.x}
          y2={w.b.y}
          stroke="#888"
          strokeWidth={4}
          strokeLinecap="round"
        />
      ))}
      {section.parts.map((part, i) => (
        <PartPreview key={'p' + i} part={part} />
      ))}
    </g>
  );
};

const PartPreview = ({ part }: { part: Section['parts'][number] }) => {
  if (part.type === PART_FIELD) {
    const field = part as Field;
    return (
      <rect
        x={field.x}
        y={field.y}
        width={field.w}
        height={field.h}
        fill="rgba(70,140,220,0.18)"
      />
    );
  }
  if (part.type === PART_PADDLE) {
    const paddle = part as Paddle;
    const line = paddle.getLine();
    return (
      <line
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
    const len = 24;
    return (
      <line
        x1={launcher.x}
        y1={launcher.y}
        x2={launcher.x - launcher.dir.x * len}
        y2={launcher.y - launcher.dir.y * len}
        stroke={launcher.active ? '#fc8' : '#c84'}
        strokeWidth={8}
        strokeLinecap="round"
      />
    );
  }
  const obstacle = part as Obstacle;
  const ca = Math.cos(obstacle.angle);
  const sa = Math.sin(obstacle.angle);
  return (
    <g>
      {obstacle.walls.map((w, i) => {
        const x1 = w.a.x * ca - w.a.y * sa + obstacle.x;
        const y1 = w.a.x * sa + w.a.y * ca + obstacle.y;
        const x2 = w.b.x * ca - w.b.y * sa + obstacle.x;
        const y2 = w.b.x * sa + w.b.y * ca + obstacle.y;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={obstacle.active ? '#fc8' : '#888'}
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
