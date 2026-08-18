import { Ball, ballCreate } from '../model/Ball';
import { LAUNCHER_X, LAUNCHER_Y } from '../model/constants';
import { buildLevel } from '../model/builders';
import { Section, flattenSectionWalls } from '../model/Section';
import { Line } from '../sim/physics';
import { LINKS, SECTIONS } from '../model/levels';

export type State = {
  balls: Ball[];
  walls: Line[];
  sections: Section[];
  input: boolean[];
};

export const createState = (): State => {
  const sections = buildLevel(SECTIONS, LINKS);
  return {
    balls: [ballCreate(LAUNCHER_X, LAUNCHER_Y)],
    sections,
    walls: flattenSectionWalls(sections),
    input: [false, false, false],
  };
};
