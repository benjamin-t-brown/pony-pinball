import { BALL_R } from '@game/model/constants';
import {
  B_FIELD,
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  num,
} from '@game/machine/MachineCalls';
import type { MachineMeta } from '@game/machine/MachineTypes';
import { completeSectionOf } from '@game/machine/MachineGoals';
import { partIdsInCalls, wallIdsInCalls } from '@game/machine/EntityIdFuncs';
import { rectsOverlap, sharedBoundary } from './geometry';
import type { Opening, SectionData } from './types';

export type Issue = {
  level: 'error' | 'warn';
  message: string;
};

const MIN_OPENING = 2 * BALL_R + 4;

export const validateLevel = (
  sections: SectionData[],
  openings: Opening[]
): Issue[] => {
  const issues: Issue[] = [];

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      if (rectsOverlap(sections[i], sections[j])) {
        issues.push({
          level: 'error',
          message: `Sections ${i} and ${j} overlap`,
        });
      }
    }
  }

  for (let i = 0; i < openings.length; i++) {
    const o = openings[i];
    if (o.width < MIN_OPENING) {
      issues.push({
        level: 'error',
        message: `Opening ${i} is ${o.width}px; need at least ${MIN_OPENING}px`,
      });
    }
    const a = sections[o.a];
    if (!a) {
      issues.push({
        level: 'error',
        message: `Opening ${i} references missing section ${o.a}`,
      });
      continue;
    }
    if (o.b < 0) {
      issues.push({
        level: 'warn',
        message: `Opening ${i} is one-sided (section ${o.a} side ${o.aSide})`,
      });
      continue;
    }
    const b = sections[o.b];
    if (!b) {
      issues.push({
        level: 'error',
        message: `Opening ${i} references missing section ${o.b}`,
      });
      continue;
    }
    const share = sharedBoundary(a, b);
    if (!share) {
      issues.push({
        level: 'error',
        message: `Opening ${i}: sections ${o.a} and ${o.b} do not share an edge`,
      });
    }
  }

  if (sections.length > 0) {
    const reachable = new Set<number>([0]);
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < openings.length; i++) {
        const o = openings[i];
        if (o.b < 0) {
          continue;
        }
        const a = sections[o.a];
        const b = sections[o.b];
        if (!a || !b || !sharedBoundary(a, b)) {
          continue;
        }
        if (reachable.has(o.a) && !reachable.has(o.b)) {
          reachable.add(o.b);
          grew = true;
        }
        if (reachable.has(o.b) && !reachable.has(o.a)) {
          reachable.add(o.a);
          grew = true;
        }
      }
    }
    for (let i = 0; i < sections.length; i++) {
      if (!reachable.has(i)) {
        issues.push({
          level: 'warn',
          message: `Section ${i} is unreachable from section 0`,
        });
      }
    }
  }

  return issues;
};

export const validateMachine = (
  meta: MachineMeta,
  sections: SectionData[]
): Issue[] => {
  const issues: Issue[] = [];
  const sectionCount = sections.length;
  if (sectionCount === 0) {
    return issues;
  }
  const win = completeSectionOf(meta);
  if (win >= 0 && win >= sectionCount) {
    issues.push({
      level: 'error',
      message: `Complete section ${win} is out of range`,
    });
  }
  for (let i = 0; i < meta.menuTour.length; i++) {
    const id = meta.menuTour[i];
    if (id < 0 || id >= sectionCount) {
      issues.push({
        level: 'warn',
        message: `Menu tour stop ${i} points at missing section ${id}`,
      });
    }
  }
  for (let i = 0; i < meta.collectGoals.length; i++) {
    const g = meta.collectGoals[i];
    if (g.disableWall) {
      if (
        g.disableWall.section < 0 ||
        g.disableWall.section >= sectionCount
      ) {
        issues.push({
          level: 'error',
          message: `Collect goal ${i} disable wall section ${g.disableWall.section} is missing`,
        });
      } else {
        const id = g.disableWall.wall;
        if (!id || !wallIdsInCalls(sections[g.disableWall.section][4]).has(id)) {
          issues.push({
            level: 'warn',
            message: `Collect goal ${i} disable wall id ${id} is missing in section ${g.disableWall.section}`,
          });
        }
      }
    }
    if (g.activatePart) {
      if (
        g.activatePart.section < 0 ||
        g.activatePart.section >= sectionCount
      ) {
        issues.push({
          level: 'error',
          message: `Collect goal ${i} light section ${g.activatePart.section} is missing`,
        });
      } else {
        const id = g.activatePart.part;
        if (!id || !partIdsInCalls(sections[g.activatePart.section][4]).has(id)) {
          issues.push({
            level: 'warn',
            message: `Collect goal ${i} light part id ${id} is missing in section ${g.activatePart.section}`,
          });
        }
      }
    }
  }
  for (let si = 0; si < sections.length; si++) {
    const calls = sections[si][4];
    const walls = wallIdsInCalls(calls);
    const parts = partIdsInCalls(calls);
    for (let ci = 0; ci < calls.length; ci++) {
      const call = calls[ci];
      if (call.kind !== B_FIELD) {
        continue;
      }
      if (call.trigger === TRIGGER_DEACTIVATE_WALL || call.trigger == null) {
        const id = num(call.wall);
        if (id && !walls.has(id)) {
          issues.push({
            level: 'warn',
            message: `Section ${si} field trigger wall id ${id} is missing`,
          });
        }
      }
      if (call.trigger === TRIGGER_ACTIVATE_LIGHT) {
        const id = num(call.part);
        if (id && !parts.has(id)) {
          issues.push({
            level: 'warn',
            message: `Section ${si} field trigger part id ${id} is missing`,
          });
        }
      }
    }
  }
  return issues;
};

