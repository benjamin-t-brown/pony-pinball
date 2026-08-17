import { type Line, lineCreate } from '../sim/physics';
import { ballCreate, type Ball } from './ball';
import {
  H,
  LEFT_PIVOT,
  LEFT_REST,
  LEFT_UP,
  RIGHT_PIVOT,
  RIGHT_REST,
  RIGHT_UP,
  W,
} from './constants';
import { paddleCreate, type Paddle } from './paddle';

export type GameInput = {
  left: boolean;
  right: boolean;
};

export type GameState = {
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  walls: Line[];
  input: GameInput;
  width: number;
  height: number;
};

export const createWalls = (w: number, h: number): Line[] => [
  lineCreate(20, 20, 20, h - 20),
  lineCreate(w - 20, 20, w - 20, h - 20),
  lineCreate(20, 20, w - 20, 20),
  lineCreate(20, 140, 90, 280),
  lineCreate(w - 20, 140, w - 90, 280),
  lineCreate(90, 280, 130, 430),
  lineCreate(w - 90, 280, w - 130, 430),
  lineCreate(20, 470, 110, 510),
  lineCreate(w - 20, 470, w - 110, 510),
  lineCreate(150, 455, 250, 455),
];

export const createGameState = (): GameState => ({
  ball: ballCreate(),
  leftPaddle: paddleCreate(LEFT_PIVOT, LEFT_REST, LEFT_UP),
  rightPaddle: paddleCreate(RIGHT_PIVOT, RIGHT_REST, RIGHT_UP),
  walls: createWalls(W, H),
  input: { left: false, right: false },
  width: W,
  height: H,
});
