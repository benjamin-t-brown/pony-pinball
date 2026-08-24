import { getGameRoot } from './dom';
import { LayerManager } from './layers/LayerManager';
import { DebugLayer } from './layers/DebugLayer';
import { SimLayer } from './layers/SimLayer';
import { SimUiLayer } from './layers/SimUiLayer';
import { createState, setState } from './state/State';

export const startGame = () => {
  const root = getGameRoot();
  if (!root) {
    console.error('Game root not found');
    return;
  }
  console.log('Start Game.');

  setState(createState());

  new LayerManager([
    new SimLayer(),
    new SimUiLayer(root),
    new DebugLayer(),
  ]).start();
};

addEventListener('load', startGame);
