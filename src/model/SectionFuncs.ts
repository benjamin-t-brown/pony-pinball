import type { Line } from '../sim/PhysicsFuncs';
import type { Part } from './Part';

export type Section = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  walls: Line[];
  parts: Part[];
  fills: number[][];
};

export const sectionCreate = (
  id: number,
  x: number,
  y: number,
  w: number,
  h: number
): Section => ({
  id,
  x,
  y,
  w,
  h,
  walls: [],
  parts: [],
  fills: [],
});

export const sectionContains = (section: Section, x: number, y: number) => {
  return (
    x >= section.x &&
    x <= section.x + section.w &&
    y >= section.y &&
    y <= section.y + section.h
  );
};

export const findSectionAt = (
  sections: Section[],
  x: number,
  y: number,
  current: Section | null
) => {
  if (current && sectionContains(current, x, y)) {
    return current;
  }
  for (let i = 0; i < sections.length; i++) {
    if (sectionContains(sections[i], x, y)) {
      return sections[i];
    }
  }
  return current;
};

export const isPointInAnySection = (
  sections: Section[],
  x: number,
  y: number,
  margin: number
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (
      x >= s.x - margin &&
      x <= s.x + s.w + margin &&
      y >= s.y - margin &&
      y <= s.y + s.h + margin
    ) {
      return true;
    }
  }
  return false;
};

export const forEachPart = (
  sections: Section[],
  fn: (part: Part, section: Section) => void
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.parts.length; j++) {
      fn(s.parts[j], s);
    }
  }
};
