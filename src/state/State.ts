import { Ball, ballCreate } from '../model/Ball';
import { buildLevel } from '../model/builders';
import { Section, flattenSectionWalls } from '../model/Section';
import { Line } from '../sim/physics';
import { LINKS, SECTIONS, START } from '../levels';

export type State = {
  balls: Ball[];
  walls: Line[];
  sections: Section[];
  input: boolean[];
  startX: number;
  startY: number;
  /** Counts of collected items keyed by groupType. */
  collected: number[];
};

export let state: State;

export const getState = () => {
  return state;
};

export const setState = (s: State) => {
  state = s;
};

export const createState = (): State => {
  const sections = buildLevel(SECTIONS, LINKS);
  return {
    balls: [ballCreate(START[0], START[1])],
    sections,
    walls: flattenSectionWalls(sections),
    input: [false, false, false],
    startX: START[0],
    startY: START[1],
    collected: [],
  };
};
