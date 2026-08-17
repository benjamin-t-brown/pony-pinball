import { Line, lineCreate } from '../sim/physics';
import type { Field } from './fields/Field';
import type { Obstacle } from './obstacles/Obstacle';
import type { Widget } from './widgets/Widget';

export type Section = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  walls: Line[];
  widgets: Widget[];
  obstacles: Obstacle[];
  fields: Field[];
  bg: string;
};

export const sectionCreate = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  walls: Line[],
  bg: string,
  widgets: Widget[] = [],
  obstacles: Obstacle[] = [],
  fields: Field[] = []
): Section => ({
  id,
  x,
  y,
  w,
  h,
  walls,
  widgets,
  obstacles,
  fields,
  bg,
});

export const placeAdjacent = (
  anchor: Section,
  side: string,
  w: number,
  h: number
) => {
  if (side === 'above') {
    return { x: anchor.x, y: anchor.y - h };
  }
  if (side === 'below') {
    return { x: anchor.x, y: anchor.y + anchor.h };
  }
  if (side === 'left') {
    return { x: anchor.x - w, y: anchor.y };
  }
  return { x: anchor.x + anchor.w, y: anchor.y };
};

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

export const getSection = (sections: Section[], id: string) => {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].id === id) {
      return sections[i];
    }
  }
  return sections[0];
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

export const forEachWidget = (
  sections: Section[],
  fn: (widget: Widget, section: Section) => void
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.widgets.length; j++) {
      fn(s.widgets[j], s);
    }
  }
};

export const forEachObstacle = (
  sections: Section[],
  fn: (obstacle: Obstacle, section: Section) => void
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.obstacles.length; j++) {
      fn(s.obstacles[j], s);
    }
  }
};

export const forEachField = (
  sections: Section[],
  fn: (field: Field, section: Section) => void
) => {
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.fields.length; j++) {
      fn(s.fields[j], s);
    }
  }
};

export const flattenSectionWalls = (sections: Section[]): Line[] => {
  const walls: Line[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    for (let j = 0; j < s.walls.length; j++) {
      const wall = s.walls[j];
      walls.push(
        lineCreate(
          wall.a.x + s.x,
          wall.a.y + s.y,
          wall.b.x + s.x,
          wall.b.y + s.y,
          wall.rest
        )
      );
    }
  }
  return walls;
};
