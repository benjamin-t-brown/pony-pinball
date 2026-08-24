import {
  B_COLLECTABLE,
  B_FIELD,
  B_TRIANGLE,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
} from '@game/model/builders';
import { triggerDefFor } from './schema';
import type { SectionData, Selection } from './types';

/** Walls pushed by buildSectionEdges before any builder calls. */
export const edgeWallCount = (sectionIndex: number, links: number[][]) => {
  let n = 0;
  for (let e = 0; e < 4; e++) {
    let gap = false;
    for (let k = 0; k < links.length; k++) {
      const l = links[k];
      if (l[0] === sectionIndex && l[1] === e && l[3]) {
        gap = true;
        break;
      }
    }
    n += gap ? 2 : 1;
  }
  return n;
};

export const isSegmentWallCall = (id: number) => {
  return id === B_WALL_RESTI || id === B_WALL_GATE;
};

export const wallsAddedByCall = (call: number[]) => {
  if (call[0] === B_WALLS) {
    return Math.floor((call.length - 1) / 4);
  }
  if (isSegmentWallCall(call[0])) {
    return 1;
  }
  if (call[0] === B_TRIANGLE) {
    return 3;
  }
  return 0;
};

/** Index into section.walls after build for a wall-producing call segment. */
export const builtWallIndex = (
  section: SectionData,
  sectionIndex: number,
  callIndex: number,
  segment: number,
  links: number[][]
) => {
  let index = edgeWallCount(sectionIndex, links);
  const calls = section[5];
  for (let i = 0; i < callIndex; i++) {
    const call = calls[i];
    if (call) {
      index += wallsAddedByCall(call);
    }
  }
  return index + segment;
};

/** Built wall indices produced by B_WALL_RESTI in a section. */
export const restiWallIndices = (
  section: SectionData,
  sectionIndex: number,
  links: number[][]
) => {
  const walls = new Set<number>();
  let index = edgeWallCount(sectionIndex, links);
  const calls = section[5];
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (!call) {
      continue;
    }
    if (call[0] === B_WALL_RESTI) {
      walls.add(index);
    }
    index += wallsAddedByCall(call);
  }
  return walls;
};

const mapWallAfterMove = (w: number, from: number, to: number) => {
  if (w === from) {
    return to;
  }
  if (from < to) {
    if (w > from && w <= to) {
      return w - 1;
    }
  } else if (from > to) {
    if (w >= to && w < from) {
      return w + 1;
    }
  }
  return w;
};

const forEachWallRefInSection = (
  calls: number[][],
  sectionIndex: number,
  fn: (call: number[], argIndex: number) => void
) => {
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (!call) {
      continue;
    }
    if (call[0] === B_FIELD) {
      const trig = triggerDefFor(call[5] ?? 0);
      for (let a = 0; a < trig.args.length; a++) {
        if (trig.args[a] === 'wall') {
          fn(call, 6 + a);
        }
      }
      continue;
    }
    if (call[0] === B_COLLECTABLE) {
      const trig = triggerDefFor(call[5] ?? 0);
      let targetSection = sectionIndex;
      let hasSection = false;
      for (let a = 0; a < trig.args.length; a++) {
        if (trig.args[a] === 'section') {
          hasSection = true;
          targetSection = call[6 + a] ?? targetSection;
        }
      }
      if (hasSection && targetSection !== sectionIndex) {
        continue;
      }
      for (let a = 0; a < trig.args.length; a++) {
        if (trig.args[a] === 'wall') {
          fn(call, 6 + a);
        }
      }
    }
  }
};

/** Shift / clear trigger wall args after a built wall is removed. */
export const remapTriggerWalls = (
  calls: number[][],
  deleted: number,
  sectionIndex = 0
) => {
  forEachWallRefInSection(calls, sectionIndex, (call, k) => {
    const wall = call[k];
    if (wall === deleted) {
      call[k] = -1;
    } else if (wall > deleted) {
      call[k] = wall - 1;
    }
  });
};

export const remapWallRefMove = (
  calls: number[][],
  sectionIndex: number,
  from: number,
  to: number
) => {
  if (from === to) {
    return;
  }
  forEachWallRefInSection(calls, sectionIndex, (call, k) => {
    call[k] = mapWallAfterMove(call[k], from, to);
  });
};

const ensureWallsCallIndex = (section: SectionData) => {
  for (let i = 0; i < section[5].length; i++) {
    if (section[5][i][0] === B_WALLS) {
      return i;
    }
  }
  section[5].unshift([B_WALLS]);
  return 0;
};

const defaultExtra = (kind: number) => {
  if (kind === B_WALL_RESTI) {
    return 0.5;
  }
  if (kind === B_WALL_GATE) {
    return 0;
  }
  return 0;
};

/**
 * Convert a selected wall segment between Walls / Wall resti / Wall gate.
 * Remaps trigger wall indices when build order changes.
 */
export const convertWallKind = (
  sections: SectionData[],
  selection: { section: number; call: number; segment: number },
  targetKind: number,
  links: number[][]
): { sections: SectionData[]; selection: Selection } => {
  const si = selection.section;
  const section = sections[si];
  if (!section) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }
  const call = section[5][selection.call];
  if (!call) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }
  const fromKind = call[0];
  if (fromKind === targetKind) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }
  if (
    targetKind !== B_WALLS &&
    targetKind !== B_WALL_RESTI &&
    targetKind !== B_WALL_GATE
  ) {
    return { sections, selection: { kind: 'wall', ...selection } };
  }

  const next = sections.map(s => [
    s[0],
    s[1],
    s[2],
    s[3],
    s[4],
    s[5].map(c => c.slice()),
  ]) as SectionData[];
  const dest = next[si];
  const srcCall = dest[5][selection.call];
  const k = 1 + selection.segment * 4;
  const x0 = srcCall[k];
  const y0 = srcCall[k + 1];
  const x1 = srcCall[k + 2];
  const y1 = srcCall[k + 3];
  const oldIndex = builtWallIndex(
    section,
    si,
    selection.call,
    selection.segment,
    links
  );

  if (isSegmentWallCall(fromKind) && isSegmentWallCall(targetKind)) {
    srcCall[0] = targetKind;
    srcCall[5] = defaultExtra(targetKind);
    return {
      sections: next,
      selection: { kind: 'wall', section: si, call: selection.call, segment: 0 },
    };
  }

  if (isSegmentWallCall(fromKind) && targetKind === B_WALLS) {
    dest[5].splice(selection.call, 1);
    const ci = ensureWallsCallIndex(dest);
    dest[5][ci].push(x0, y0, x1, y1);
    const segment = Math.floor((dest[5][ci].length - 5) / 4);
    const newIndex = builtWallIndex(dest, si, ci, segment, links);
    remapWallRefMove(dest[5], si, oldIndex, newIndex);
    return {
      sections: next,
      selection: { kind: 'wall', section: si, call: ci, segment },
    };
  }

  if (fromKind === B_WALLS && isSegmentWallCall(targetKind)) {
    srcCall.splice(k, 4);
    if (srcCall.length <= 1) {
      dest[5].splice(selection.call, 1);
    }
    dest[5].push([targetKind, x0, y0, x1, y1, defaultExtra(targetKind)]);
    const ci = dest[5].length - 1;
    const newIndex = builtWallIndex(dest, si, ci, 0, links);
    remapWallRefMove(dest[5], si, oldIndex, newIndex);
    return {
      sections: next,
      selection: { kind: 'wall', section: si, call: ci, segment: 0 },
    };
  }

  return { sections, selection: { kind: 'wall', ...selection } };
};
