import {
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
} from '@game/model/Builders';
import {
  isPartCall,
  wallIdAt,
  wallSegmentCount,
} from '@game/machine/EntityIdFuncs';
import {
  builderIdToKind,
  cloneCall,
  cloneCalls,
  isSegmentWallKind,
  type MachineCall,
  type WallGateCall,
  type WallRestiCall,
  type WallsCall,
} from '@game/machine/MachineCalls';
import type { SectionData, Selection } from './types';

export const isSegmentWallCall = (id: number) => {
  return id === B_WALL_RESTI || id === B_WALL_GATE;
};

export const wallsAddedByCall = (call: MachineCall) => {
  return wallSegmentCount(call);
};

export const partsAddedByCall = (call: MachineCall) => {
  return isPartCall(call) ? 1 : 0;
};

const ensureWallsCallIndex = (section: SectionData) => {
  for (let i = 0; i < section[4].length; i++) {
    if (section[4][i].kind === B_WALLS) {
      return i;
    }
  }
  section[4].unshift({ kind: B_WALLS, segments: [] });
  return 0;
};

const defaultExtra = (kind: typeof B_WALL_RESTI | typeof B_WALL_GATE) => {
  if (kind === B_WALL_RESTI) {
    return 0.5;
  }
  return 0;
};

/**
 * Convert a selected wall segment between Walls / Wall resti / Wall gate.
 * The wall id stays on the geometry so triggers keep pointing at it.
 */
export const convertWallKind = (
  sections: SectionData[],
  selection: { section: number; call: number; segment: number },
  targetKind: number,
  _links: number[][]
): { sections: SectionData[]; selection: Selection } => {
  const si = selection.section;
  const section = sections[si];
  if (!section) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }
  const call = section[4][selection.call];
  if (!call) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }
  const fromKind = call.kind;
  const target = builderIdToKind(targetKind);
  if (fromKind === target) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }
  if (target !== B_WALLS && target !== B_WALL_RESTI && target !== B_WALL_GATE) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }

  const next = sections.map(s => [
    s[0],
    s[1],
    s[2],
    s[3],
    cloneCalls(s[4]),
  ]) as SectionData[];
  const dest = next[si];
  const srcCall = dest[4][selection.call];
  let x0 = 0;
  let y0 = 0;
  let x1 = 0;
  let y1 = 0;
  const id = wallIdAt(srcCall, selection.segment);
  if (srcCall.kind === B_WALLS) {
    const seg = srcCall.segments[selection.segment];
    if (!seg) {
      return { sections, selection: { kind: 'wall', ...selection } };
    }
    x0 = seg.x0;
    y0 = seg.y0;
    x1 = seg.x1;
    y1 = seg.y1;
  } else if (srcCall.kind === B_WALL_RESTI || srcCall.kind === B_WALL_GATE) {
    x0 = srcCall.x0;
    y0 = srcCall.y0;
    x1 = srcCall.x1;
    y1 = srcCall.y1;
  } else {
    return { sections, selection: { kind: 'wall', ...selection } };
  }

  if (isSegmentWallKind(fromKind) && isSegmentWallKind(target)) {
    if (target === B_WALL_RESTI) {
      dest[4][selection.call] = {
        kind: B_WALL_RESTI,
        x0,
        y0,
        x1,
        y1,
        rest: defaultExtra(B_WALL_RESTI),
        id,
      };
    } else {
      dest[4][selection.call] = {
        kind: B_WALL_GATE,
        x0,
        y0,
        x1,
        y1,
        color: defaultExtra(B_WALL_GATE),
        id,
      };
    }
    return {
      sections: next,
      selection: { kind: 'wall', section: si, call: selection.call, segment: 0 },
    };
  }

  if (isSegmentWallKind(fromKind) && target === B_WALLS) {
    dest[4].splice(selection.call, 1);
    const ci = ensureWallsCallIndex(dest);
    const walls = dest[4][ci] as WallsCall;
    walls.segments.push({ x0, y0, x1, y1, id });
    const segment = walls.segments.length - 1;
    return {
      sections: next,
      selection: { kind: 'wall', section: si, call: ci, segment },
    };
  }

  if (fromKind === B_WALLS && isSegmentWallKind(target)) {
    const walls = srcCall as WallsCall;
    walls.segments.splice(selection.segment, 1);
    if (walls.segments.length === 0) {
      dest[4].splice(selection.call, 1);
    }
    const converted: WallRestiCall | WallGateCall =
      target === B_WALL_RESTI
        ? {
            kind: B_WALL_RESTI,
            x0,
            y0,
            x1,
            y1,
            rest: defaultExtra(B_WALL_RESTI),
            id,
          }
        : {
            kind: B_WALL_GATE,
            x0,
            y0,
            x1,
            y1,
            color: defaultExtra(B_WALL_GATE),
            id,
          };
    dest[4].push(converted);
    const ci = dest[4].length - 1;
    return {
      sections: next,
      selection: { kind: 'wall', section: si, call: ci, segment: 0 },
    };
  }

  return { sections, selection: { kind: 'wall', ...selection } };
};

export { cloneCall };
