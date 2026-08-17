import type { GameState } from '../model/gameState';
import { updateSimulation } from '../sim/updateSimulation';
import { drawBall, type BallView } from '../ui/ballView';
import { drawPaddle, type PaddleView } from '../ui/paddleView';
import type { Layer } from './types';

export type SimViews = {
  ball: BallView;
  leftPaddle: PaddleView;
  rightPaddle: PaddleView;
};

export const createSimLayer = (state: GameState, views: SimViews): Layer => ({
  name: 'sim',
  update: (dt: number) => {
    updateSimulation(state, dt);
  },
  draw: () => {
    drawBall(views.ball, state.ball);
    drawPaddle(views.leftPaddle, state.leftPaddle);
    drawPaddle(views.rightPaddle, state.rightPaddle);
  },
});
