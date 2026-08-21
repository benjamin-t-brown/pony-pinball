import { getGameRoot } from './dom';
import { LayerManager } from './layers/LayerManager';
import { DebugLayer } from './layers/DebugLayer';
import { SimLayer } from './layers/SimLayer';
import { SimUiLayer } from './layers/SimUiLayer';
import { createState } from './state/State';
import { StateManager } from './state/StateManager';
import { StateManagerInterface } from './state/StateManagerInterface';

export const startGame = () => {
  const root = getGameRoot();
  if (!root) {
    console.error('Game root not found');
    return;
  }
  console.log('Start Game.');

  const state = createState();
  const stateManager = new StateManager(state);
  StateManagerInterface.setStateManager(stateManager);

  new LayerManager(
    [new SimLayer(), new SimUiLayer(root), new DebugLayer()],
    stateManager
  ).start();
};

addEventListener('load', startGame);
