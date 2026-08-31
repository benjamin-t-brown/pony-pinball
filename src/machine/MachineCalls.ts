/**
 * Named machine calls. Shared part keys live on PartProps so a new field
 * (opacity, later tint, locked, …) is one optional property, not a new
 * positional slot in every opcode.
 *
 * Walls are not parts: they have segments / endpoints, not opacity.
 * `kind` is a numeric B_* constant (same ids the editor palette uses).
 * Field `trigger` is a numeric TRIGGER_* constant (same ids as TRIGGERS[]).
 * Decoration `decoration` is a numeric DEC_* constant.
 */

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

export const TRIGGER_DEACTIVATE_WALL = 0;
export const TRIGGER_ACTIVATE_LIGHT = 3;
export const TRIGGER_PLAY_SOUND = 5;

export const DEC_BLINKING_LIGHT = 0;
export const DEC_BLINKING_LIGHT_LINE = 1;
export const DEC_ICON = 2;
export const DEC_RAINBOW = 3;

/** Present on every part-producing call. Omitted values use the defaults. */
export type PartProps = {
  /** Stable id for triggers / collect goals. Assigned if missing. */
  id?: number;
  /** 0..1. Default 1. */
  opacity?: number;
};

export type WallSegment = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  id?: number;
};

export type WallsCall = {
  kind: typeof B_WALLS;
  segments: WallSegment[];
};

export type WallRestiCall = {
  kind: typeof B_WALL_RESTI;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  rest?: number;
  id?: number;
};

export type WallGateCall = {
  kind: typeof B_WALL_GATE;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color?: number;
  id?: number;
};

export type FlipperCall = PartProps & {
  kind: typeof B_FLIPPER_LEFT;
  x: number;
  y: number;
  restAngle?: number;
  upAngle?: number;
  flipped?: boolean;
  length?: number;
};

export type LauncherCall = PartProps & {
  kind: typeof B_LAUNCHER;
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  force?: number;
  range?: number;
  chargeMs?: number;
  length?: number;
};

export type FieldTrigger =
  | typeof TRIGGER_DEACTIVATE_WALL
  | typeof TRIGGER_ACTIVATE_LIGHT
  | typeof TRIGGER_PLAY_SOUND;

export type FieldCall = PartProps & {
  kind: typeof B_FIELD;
  x: number;
  y: number;
  w: number;
  h: number;
  trigger?: FieldTrigger;
  wall?: number;
  part?: number;
  sound?: number;
  onDelay?: number;
  offDelay?: number;
};

export type ConveyerCall = PartProps & {
  kind: typeof B_CONVEYER;
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
  power?: number;
  maxSpeed?: number;
  drag?: number;
};

export type CircleCall = PartProps & {
  kind: typeof B_CIRCLE;
  x: number;
  y: number;
  resolution?: number;
  restitution?: number;
  radius?: number;
  dx?: number;
  dy?: number;
  omega?: number;
  icon?: number;
  color?: number;
};

export type FanCall = PartProps & {
  kind: typeof B_FAN;
  x: number;
  y: number;
  paddles?: number;
  restitution?: number;
  radius?: number;
  omega?: number;
};

export type CollectableCall = PartProps & {
  kind: typeof B_COLLECTABLE;
  x: number;
  y: number;
};

export type PortalCall = PartProps & {
  kind: typeof B_PORTAL;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color?: number;
};

export type TriangleCall = {
  kind: typeof B_TRIANGLE;
  x: number;
  y: number;
  sideLen1?: number;
  sideLen2?: number;
  rot?: number;
  resti0?: number;
  resti1?: number;
  resti2?: number;
  id0?: number;
  id1?: number;
  id2?: number;
};

export type DecorationStyle =
  | typeof DEC_BLINKING_LIGHT
  | typeof DEC_BLINKING_LIGHT_LINE
  | typeof DEC_ICON
  | typeof DEC_RAINBOW;

export type DecorationCall = PartProps & {
  kind: typeof B_DECORATION;
  x: number;
  y: number;
  scale?: number;
  rot?: number;
  decoration?: DecorationStyle;
  texture?: number;
  shape?: number;
  startOn?: number;
  interval?: number;
  count?: number;
  x1?: number;
  y1?: number;
  delay?: number;
  w?: number;
  h?: number;
};

export type MachineCall =
  | WallsCall
  | WallRestiCall
  | WallGateCall
  | FlipperCall
  | LauncherCall
  | FieldCall
  | ConveyerCall
  | CircleCall
  | FanCall
  | CollectableCall
  | PortalCall
  | TriangleCall
  | DecorationCall;

export const num = (v?: number | null) => {
  return v == null ? 0 : v;
};

export const PART_PROP_KEYS = ['id', 'opacity'] as const;

export const DEFAULT_PART_OPACITY = 1;

export const isLegacyCall = (call: unknown): call is number[] => {
  return Array.isArray(call);
};

export const cloneCall = (call: MachineCall): MachineCall => {
  return structuredClone(call);
};

export const cloneCalls = (calls: MachineCall[]): MachineCall[] => {
  return calls.map(cloneCall);
};

export const isWallKind = (kind: MachineCall['kind']) => {
  return kind === B_WALLS || kind === B_WALL_RESTI || kind === B_WALL_GATE;
};

export const isSegmentWallKind = (kind: MachineCall['kind']) => {
  return kind === B_WALL_RESTI || kind === B_WALL_GATE;
};

export const isPartKind = (kind: MachineCall['kind']) => {
  return (
    kind === B_FLIPPER_LEFT ||
    kind === B_LAUNCHER ||
    kind === B_FIELD ||
    kind === B_CIRCLE ||
    kind === B_CONVEYER ||
    kind === B_COLLECTABLE ||
    kind === B_FAN ||
    kind === B_PORTAL ||
    kind === B_DECORATION
  );
};

export const isRectKind = (kind: MachineCall['kind']) => {
  return kind === B_FIELD || kind === B_CONVEYER;
};

export const wallSegmentsOf = (call: MachineCall): WallSegment[] => {
  if (call.kind === B_WALLS) {
    return call.segments;
  }
  if (call.kind === B_WALL_RESTI || call.kind === B_WALL_GATE) {
    return [
      {
        x0: call.x0,
        y0: call.y0,
        x1: call.x1,
        y1: call.y1,
        id: call.id,
      },
    ];
  }
  return [];
};

export const wallSegmentCount = (call: MachineCall) => {
  if (call.kind === B_TRIANGLE) {
    return 3;
  }
  return wallSegmentsOf(call).length;
};

export const wallIdAt = (call: MachineCall, segment: number) => {
  if (call.kind === B_TRIANGLE) {
    if (segment === 0) {
      return num(call.id0);
    }
    if (segment === 1) {
      return num(call.id1);
    }
    if (segment === 2) {
      return num(call.id2);
    }
    return 0;
  }
  const segs = wallSegmentsOf(call);
  return num(segs[segment] && segs[segment].id);
};

export const setWallIdAt = (call: MachineCall, segment: number, id: number) => {
  if (call.kind === B_TRIANGLE) {
    if (segment === 0) {
      call.id0 = id;
    } else if (segment === 1) {
      call.id1 = id;
    } else if (segment === 2) {
      call.id2 = id;
    }
    return;
  }
  if (call.kind === B_WALLS) {
    const seg = call.segments[segment];
    if (seg) {
      seg.id = id;
    }
    return;
  }
  if (call.kind === B_WALL_RESTI || call.kind === B_WALL_GATE) {
    call.id = id;
  }
};

export const partIdOf = (call: MachineCall) => {
  if (!isPartKind(call.kind)) {
    return 0;
  }
  return num('id' in call ? call.id : 0);
};

export const setPartId = (call: MachineCall, id: number) => {
  if (isPartKind(call.kind)) {
    (call as PartProps).id = id;
  }
};

export const partOpacityOf = (call: MachineCall) => {
  if (!isPartKind(call.kind)) {
    return DEFAULT_PART_OPACITY;
  }
  const o = (call as PartProps).opacity;
  return o == null ? DEFAULT_PART_OPACITY : o;
};

const TRIGGER_FROM_NAME: Record<string, FieldTrigger> = {
  deactivateWall: TRIGGER_DEACTIVATE_WALL,
  activateLight: TRIGGER_ACTIVATE_LIGHT,
  playSound: TRIGGER_PLAY_SOUND,
};

const DEC_FROM_NAME: Record<string, DecorationStyle> = {
  light: DEC_BLINKING_LIGHT,
  lightLine: DEC_BLINKING_LIGHT_LINE,
  icon: DEC_ICON,
  rainbow: DEC_RAINBOW,
};

export const triggerFromId = (id: number): FieldTrigger => {
  if (id === TRIGGER_ACTIVATE_LIGHT || id === TRIGGER_PLAY_SOUND) {
    return id;
  }
  return TRIGGER_DEACTIVATE_WALL;
};

export const decorationFromId = (id: number): DecorationStyle => {
  if (
    id === DEC_BLINKING_LIGHT_LINE ||
    id === DEC_ICON ||
    id === DEC_RAINBOW
  ) {
    return id;
  }
  return DEC_BLINKING_LIGHT;
};

export const fieldTriggerId = (trigger?: FieldTrigger | string | number) => {
  if (typeof trigger === 'string') {
    return TRIGGER_FROM_NAME[trigger] ?? TRIGGER_DEACTIVATE_WALL;
  }
  return triggerFromId(trigger ?? TRIGGER_DEACTIVATE_WALL);
};

export const decorationStyleId = (style?: DecorationStyle | string | number) => {
  if (typeof style === 'string') {
    return DEC_FROM_NAME[style] ?? DEC_BLINKING_LIGHT;
  }
  return decorationFromId(style ?? DEC_BLINKING_LIGHT);
};

/** Opcode integers from the old compact format. */
export const callFromLegacy = (raw: number[]): MachineCall => {
  const op = raw[0];
  if (op === 0) {
    const segments: WallSegment[] = [];
    const n = raw.length - 1;
    const stride = n % 5 === 0 ? 5 : 4;
    for (let i = 1; i + 3 < raw.length; i += stride) {
      segments.push({
        x0: raw[i],
        y0: raw[i + 1],
        x1: raw[i + 2],
        y1: raw[i + 3],
        id: stride === 5 ? raw[i + 4] | 0 : 0,
      });
    }
    return { kind: B_WALLS, segments };
  }
  if (op === 1) {
    return {
      kind: B_WALL_RESTI,
      x0: raw[1],
      y0: raw[2],
      x1: raw[3],
      y1: raw[4],
      rest: raw[5],
      id: raw[6] | 0,
    };
  }
  if (op === 3) {
    return {
      kind: B_WALL_GATE,
      x0: raw[1],
      y0: raw[2],
      x1: raw[3],
      y1: raw[4],
      color: raw[5] | 0,
      id: raw[6] | 0,
    };
  }
  if (op === 5) {
    return {
      kind: B_FLIPPER_LEFT,
      x: raw[1],
      y: raw[2],
      restAngle: raw[3],
      upAngle: raw[4],
      flipped: !!raw[5],
      length: raw[6],
      id: raw[7] | 0,
    };
  }
  if (op === 2) {
    return {
      kind: B_LAUNCHER,
      x: raw[1],
      y: raw[2],
      dx: raw[3],
      dy: raw[4],
      force: raw[5],
      range: raw[6],
      chargeMs: raw[7],
      length: raw[8],
      id: raw[9] | 0,
    };
  }
  if (op === 4) {
    const trigger = triggerFromId(raw[5] | 0);
    const next: FieldCall = {
      kind: B_FIELD,
      x: raw[1],
      y: raw[2],
      w: raw[3],
      h: raw[4],
      trigger,
    };
    if (trigger === TRIGGER_DEACTIVATE_WALL) {
      next.wall = raw[6] | 0;
      next.onDelay = raw[7] | 0;
      next.offDelay = raw[8] | 0;
      next.id = raw[9] | 0;
    } else if (trigger === TRIGGER_ACTIVATE_LIGHT) {
      next.part = raw[6] | 0;
      next.onDelay = raw[7] | 0;
      next.offDelay = raw[8] | 0;
      next.id = raw[9] | 0;
    } else {
      next.sound = raw[6] | 0;
      next.id = raw[7] | 0;
    }
    return next;
  }
  if (op === 7) {
    return {
      kind: B_CONVEYER,
      x: raw[1],
      y: raw[2],
      w: raw[3],
      h: raw[4],
      angle: raw[5],
      power: raw[6],
      maxSpeed: raw[7],
      drag: raw[8],
      id: raw[9] | 0,
    };
  }
  if (op === 6) {
    return {
      kind: B_CIRCLE,
      x: raw[1],
      y: raw[2],
      resolution: raw[3],
      restitution: raw[4],
      radius: raw[5],
      dx: raw[6],
      dy: raw[7],
      omega: raw[8],
      icon: raw[9] | 0,
      color: raw[10] | 0,
      id: raw[11] | 0,
    };
  }
  if (op === 9) {
    return {
      kind: B_FAN,
      x: raw[1],
      y: raw[2],
      paddles: raw[3],
      restitution: raw[4],
      radius: raw[5],
      omega: raw[6],
      id: raw[7] | 0,
    };
  }
  if (op === 8) {
    return {
      kind: B_COLLECTABLE,
      x: raw[1],
      y: raw[2],
      id: raw[3] | 0,
    };
  }
  if (op === 10) {
    return {
      kind: B_PORTAL,
      x0: raw[1],
      y0: raw[2],
      x1: raw[3],
      y1: raw[4],
      color: raw[5] | 0,
      id: raw[6] | 0,
    };
  }
  if (op === 11) {
    return {
      kind: B_TRIANGLE,
      x: raw[1],
      y: raw[2],
      sideLen1: raw[3],
      sideLen2: raw[4],
      rot: raw[5],
      resti0: raw[6],
      resti1: raw[7],
      resti2: raw[8],
      id0: raw[9] | 0,
      id1: raw[10] | 0,
      id2: raw[11] | 0,
    };
  }
  if (op === 12) {
    const decoration = decorationFromId(raw[5] | 0);
    const next: DecorationCall = {
      kind: B_DECORATION,
      x: raw[1],
      y: raw[2],
      scale: raw[3],
      rot: raw[4],
      decoration,
      texture: raw[6] | 0,
    };
    if (decoration === DEC_BLINKING_LIGHT) {
      next.shape = raw[7] | 0;
      next.startOn = raw[8] | 0;
      next.interval = raw[9];
      next.id = raw[10] | 0;
    } else if (decoration === DEC_BLINKING_LIGHT_LINE) {
      next.interval = raw[7];
      next.shape = raw[8] | 0;
      next.count = raw[9] | 0;
      next.x1 = raw[10];
      next.y1 = raw[11];
      next.delay = raw[12];
      next.startOn = raw[13] | 0;
      next.id = raw[14] | 0;
    } else if (decoration === DEC_ICON) {
      next.opacity = raw[7];
      next.id = raw[8] | 0;
    } else {
      next.w = raw[7];
      next.h = raw[8];
      next.id = raw[9] | 0;
    }
    return next;
  }
  return { kind: B_COLLECTABLE, x: raw[1] || 0, y: raw[2] || 0 };
};

export const kindToBuilderId = (kind: MachineCall['kind']) => {
  return kind;
};

export const builderIdToKind = (id: number): MachineCall['kind'] => {
  if (id >= B_WALLS && id <= B_DECORATION) {
    return id as MachineCall['kind'];
  }
  return B_COLLECTABLE;
};

const KIND_FROM_NAME: Record<string, MachineCall['kind']> = {
  walls: B_WALLS,
  wallResti: B_WALL_RESTI,
  launcher: B_LAUNCHER,
  wallGate: B_WALL_GATE,
  field: B_FIELD,
  flipper: B_FLIPPER_LEFT,
  circle: B_CIRCLE,
  conveyer: B_CONVEYER,
  collectable: B_COLLECTABLE,
  fan: B_FAN,
  portal: B_PORTAL,
  triangle: B_TRIANGLE,
  decoration: B_DECORATION,
};

export const normalizeCall = (call: unknown): MachineCall => {
  if (isLegacyCall(call)) {
    return callFromLegacy(call);
  }
  const raw = call as Record<string, unknown>;
  const next = { ...raw };
  if (typeof next.kind === 'string') {
    next.kind = KIND_FROM_NAME[next.kind] ?? B_COLLECTABLE;
  }
  if (typeof next.trigger === 'string') {
    next.trigger = TRIGGER_FROM_NAME[next.trigger] ?? TRIGGER_DEACTIVATE_WALL;
  }
  if (typeof next.decoration === 'string') {
    next.decoration = DEC_FROM_NAME[next.decoration] ?? DEC_BLINKING_LIGHT;
  }
  return next as MachineCall;
};

export const normalizeCalls = (calls: unknown[]): MachineCall[] => {
  return calls.map(normalizeCall);
};

export const callAnchor = (
  call: MachineCall
): { x: number; y: number } | null => {
  if ('x' in call && 'y' in call && typeof call.x === 'number') {
    return { x: call.x, y: call.y };
  }
  if ('x0' in call && 'y0' in call) {
    return { x: call.x0, y: call.y0 };
  }
  if (call.kind === B_WALLS && call.segments[0]) {
    return { x: call.segments[0].x0, y: call.segments[0].y0 };
  }
  return null;
};

export const wallSegAt = (
  call: MachineCall,
  segment: number
): WallSegment | undefined => {
  const segs = wallSegmentsOf(call);
  return segs[segment];
};

export const setWallSegCoords = (
  call: MachineCall,
  segment: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  if (call.kind === B_WALLS) {
    const seg = call.segments[segment];
    if (seg) {
      seg.x0 = x0;
      seg.y0 = y0;
      seg.x1 = x1;
      seg.y1 = y1;
    }
    return;
  }
  if (call.kind === B_WALL_RESTI || call.kind === B_WALL_GATE) {
    call.x0 = x0;
    call.y0 = y0;
    call.x1 = x1;
    call.y1 = y1;
  }
};

export const setWallSegEnd = (
  call: MachineCall,
  segment: number,
  end: 0 | 1,
  x: number,
  y: number
) => {
  const seg = wallSegAt(call, segment);
  if (!seg) {
    return;
  }
  if (end === 0) {
    setWallSegCoords(call, segment, x, y, seg.x1, seg.y1);
    return;
  }
  setWallSegCoords(call, segment, seg.x0, seg.y0, x, y);
};

export const removeWallSegment = (call: MachineCall, segment: number) => {
  if (call.kind === B_WALLS) {
    call.segments.splice(segment, 1);
  }
};

export const translateCall = (call: MachineCall, dx: number, dy: number) => {
  if (call.kind === B_WALLS) {
    for (let i = 0; i < call.segments.length; i++) {
      const s = call.segments[i];
      s.x0 += dx;
      s.y0 += dy;
      s.x1 += dx;
      s.y1 += dy;
    }
    return;
  }
  if (call.kind === B_WALL_RESTI || call.kind === B_WALL_GATE || call.kind === B_PORTAL) {
    call.x0 += dx;
    call.y0 += dy;
    call.x1 += dx;
    call.y1 += dy;
    return;
  }
  if (call.kind === B_DECORATION) {
    call.x += dx;
    call.y += dy;
    if (call.decoration === DEC_BLINKING_LIGHT_LINE) {
      if (call.x1 != null) {
        call.x1 += dx;
      }
      if (call.y1 != null) {
        call.y1 += dy;
      }
    }
    return;
  }
  if ('x' in call && 'y' in call) {
    call.x += dx;
    call.y += dy;
  }
};

export const setCallAnchor = (call: MachineCall, x: number, y: number) => {
  const a = callAnchor(call);
  if (!a) {
    return;
  }
  translateCall(call, x - a.x, y - a.y);
};
