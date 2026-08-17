import { Ball, ballCreate } from '../model/ball';
import { Line, lineCreate } from '../sim/physics';
import { W, H } from '../model/constants';

export type State = {
  balls: Ball[];
  walls: Line[];
  input: { left: boolean; right: boolean };
  width: number;
  height: number;
};

export const createState = (): State => ({
  balls: [ballCreate(130, 100)],
  walls: createWalls(W, H),
  input: { left: false, right: false },
  width: 400,
  height: 600,
});

export const createWalls = (w: number, h: number): Line[] => {
  return [
    lineCreate(20, 20, 20, h - 20),
    lineCreate(w - 20, 20, w - 20, h - 20),
    lineCreate(20, 20, w - 20, 20),
    lineCreate(20, 140, 90, 280),
    lineCreate(w - 20, 140, w - 90, 280),
    lineCreate(90, 280, 130, 430),
    lineCreate(w - 90, 280, w - 130, 430),
    lineCreate(20, 470, 110, 510),
    lineCreate(w - 20, 470, w - 110, 510),
    lineCreate(150, 405, 250, 455),
  ];
};
