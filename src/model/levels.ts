import {
  B_FLIPPER_LEFT,
  B_LAUNCHER,
  B_WALLS,
  SECTION_SIDE_LEFT,
  SECTION_SIDE_BOTTOM,
  SECTION_SIDE_RIGHT,
  SECTION_SIDE_TOP,
  B_CIRCLE,
} from './builders';
import { LAUNCHER_X, LAUNCHER_Y } from './constants';
import { EDGE_ALL } from './Section';

export type SectionData = [
  number,
  number,
  number,
  number,
  number,
  number[][],
];

/**
 * x, y, w, h, bg, builder calls.
 *
 * Hand-written for now; the editor will generate this file. It still refers to
 * the launcher constants so the spawn point cannot drift from the launcher —
 * generated output will inline them.
 */
export const SECTIONS: SectionData[] = [
  [
    0, // x
    0, // y
    400, // w
    600, // h
    0, // bg index
    [
      [
        B_WALLS,
        0,
        400,
        120,
        440,
        372,
        400,
        290,
        440,
        372,
        540,
        372,
        600,
        0,
        500,
        372,
        530,
        372,
        596,
        400,
        596,
        350,
        200,
        400,
        280,
        350,
        200,
        400,
        190,
      ],
      // Call order is part order, which is both the collision order
      // (fields apply forces first, obstacles resolve before paddles) and the
      // paint order (the field's tint sits under everything).
      // [B_FIELD, 30, 40, 220, 180, 0.2, 0, -280],
      // [B_BUMPER, 200, 200, 28, 12, 20, 0, 2],
      [B_FLIPPER_LEFT, 122, 452, 0, 0],
      [B_FLIPPER_LEFT, 285, 452, 0, 0, 1],
      [B_LAUNCHER, LAUNCHER_X, LAUNCHER_Y],
      [B_CIRCLE, 200, 200, 10, 1, 100],
    ],
  ],
  [0, -400, 400, 400, 1, []],
  [400, -400, 640, 400, 2, []],
];

/** section0, section0 side, section1, section1 side, offset, width */
export const LINKS: number[][] = [
  [0, SECTION_SIDE_TOP, 150, 100],
  [1, SECTION_SIDE_BOTTOM, 150, 100],
  [1, SECTION_SIDE_RIGHT, 150, 100],
  [2, SECTION_SIDE_LEFT, 150, 100],
];
