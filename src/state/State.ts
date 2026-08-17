import { Ball, ballCreate } from '../model/Ball';
import {
  H,
  LAUNCHER_FORCE,
  LAUNCHER_RANGE,
  LAUNCHER_X,
  LAUNCHER_Y,
  LEFT_PIVOT,
  LEFT_REST,
  LEFT_UP,
  RIGHT_PIVOT,
  RIGHT_REST,
  RIGHT_UP,
  W,
} from '../model/constants';
import {
  Section,
  flattenSectionWalls,
  placeAdjacent,
  sectionCreate,
} from '../model/Section';
import { Launcher } from '../model/widgets/Launcher';
import { Paddle } from '../model/widgets/Paddle';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '../model/widgets/Widget';
import { Line, lineCreate } from '../sim/physics';

export type State = {
  balls: Ball[];
  walls: Line[];
  sections: Section[];
  input: boolean[];
};

export const createState = (): State => {
  const start = sectionCreate(
    'start',
    0,
    0,
    W,
    H,
    createStartWalls(W, H),
    '#555',
    [
      new Paddle(LEFT_PIVOT.x, LEFT_PIVOT.y, CONTROL_LEFT, LEFT_REST, LEFT_UP),
      new Paddle(
        RIGHT_PIVOT.x,
        RIGHT_PIVOT.y,
        CONTROL_RIGHT,
        RIGHT_REST,
        RIGHT_UP
      ),
      new Launcher(
        LAUNCHER_X,
        LAUNCHER_Y,
        CONTROL_START,
        -0.22,
        -1,
        LAUNCHER_FORCE,
        LAUNCHER_RANGE
      ),
    ]
  );
  const upperPos = placeAdjacent(start, 'above', 400, 400);
  const upper = sectionCreate(
    'upper',
    upperPos.x,
    upperPos.y,
    400,
    400,
    createUpperWalls(400, 400),
    '#466'
  );
  const sidePos = placeAdjacent(upper, 'right', 640, 400);
  const side = sectionCreate(
    'side',
    sidePos.x,
    sidePos.y,
    640,
    400,
    createSideWalls(640, 400),
    '#645'
  );
  const sections = [start, upper, side];
  return {
    balls: [ballCreate(LAUNCHER_X, LAUNCHER_Y)],
    sections,
    walls: flattenSectionWalls(sections),
    input: [false, false, false],
  };
};

const createStartWalls = (w: number, h: number): Line[] => {
  const lane = 372;
  return [
    lineCreate(0, 0, 0, h),
    lineCreate(w, 0, w, h),
    lineCreate(0, 0, 150, 0),
    lineCreate(250, 0, w, 0),
    lineCreate(20, 140, 90, 280),
    lineCreate(w - 20, 140, w - 90, 280),
    lineCreate(90, 280, 130, 430),
    lineCreate(w - 90, 280, w - 130, 430),
    lineCreate(20, 470, 110, 510),
    lineCreate(lane, 470, w - 110, 510),
    lineCreate(lane, 470, lane, 568),
    lineCreate(0, 560, lane, h - 4),
    lineCreate(lane, h - 4, w, h - 4),
  ];
};

const createUpperWalls = (w: number, h: number): Line[] => {
  return [
    lineCreate(0, 0, w, 0),
    lineCreate(0, 0, 0, h),
    lineCreate(0, h, 150, h),
    lineCreate(250, h, w, h),
    lineCreate(w, 0, w, 150),
    lineCreate(w, 250, w, h),
  ];
};

const createSideWalls = (w: number, h: number): Line[] => {
  return [
    lineCreate(0, 0, w, 0),
    lineCreate(w, 0, w, h),
    lineCreate(0, h, w, h),
    lineCreate(0, 0, 0, 150),
    lineCreate(0, 250, 0, h),
  ];
};
