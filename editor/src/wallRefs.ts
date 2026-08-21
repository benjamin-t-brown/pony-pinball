import { B_FIELD, B_WALLS } from '@game/model/builders';
import { triggerDefFor } from './schema';
import type { SectionData } from './types';

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

/** Index into section.walls after build for a B_WALLS segment. */
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
    if (call && call[0] === B_WALLS) {
      index += Math.floor((call.length - 1) / 4);
    }
  }
  return index + segment;
};

/** Shift / clear trigger wall args after a built wall is removed. */
export const remapTriggerWalls = (calls: number[][], deleted: number) => {
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (!call || call[0] !== B_FIELD) {
      continue;
    }
    const trig = triggerDefFor(call[5] ?? 0);
    for (let a = 0; a < trig.args.length; a++) {
      if (trig.args[a] !== 'wall') {
        continue;
      }
      const k = 6 + a;
      const wall = call[k];
      if (wall === deleted) {
        call[k] = -1;
      } else if (wall > deleted) {
        call[k] = wall - 1;
      }
    }
  }
};
