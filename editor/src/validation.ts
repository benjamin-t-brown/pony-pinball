import { BALL_R } from '@game/model/constants';
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
