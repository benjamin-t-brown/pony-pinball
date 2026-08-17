import { getGameRoot } from './dom';
import { createLayerManager } from './layerManager';
import { createSimLayer } from './layers/simLayer';
import { createUiLayer } from './layers/uiLayer';
import { createGameState } from './model/gameState';
import { createBallView } from './ui/ballView';
import { createPaddleControls } from './ui/paddleControls';
import { createPaddleView } from './ui/paddleView';
import { createPlayfield } from './ui/playfield';

export const startGame = () => {
  const root = getGameRoot();
  if (!root) {
    return;
  }

  const state = createGameState();
  const playfield = createPlayfield(root, state.walls);

  const views = {
    ball: createBallView(playfield.root),
    leftPaddle: createPaddleView(playfield.svg, state.leftPaddle, '#ff6b4a'),
    rightPaddle: createPaddleView(playfield.svg, state.rightPaddle, '#4ac8ff'),
  };

  const controls = createPaddleControls(playfield.root);

  const layers = [
    createSimLayer(state, views),
    createUiLayer(state, controls),
  ];

  createLayerManager(layers).start();
};
