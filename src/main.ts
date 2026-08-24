import { getGameRoot } from './dom';
import { LayerManager } from './layers/LayerManager';
import { DebugLayer } from './layers/DebugLayer';
import { GameCompleteUiLayer } from './layers/GameCompleteUiLayer';
import { MenuUiLayer } from './layers/MenuUiLayer';
import { SimLayer } from './layers/SimLayer';
import { SimUiLayer } from './layers/SimUiLayer';
import { injectTextureCss } from './model/parts/Decoration';
import { createState, setState } from './state/State';

export const startGame = () => {
  const root = getGameRoot();
  if (!root) {
    console.error('Game root not found');
    return;
  }
  console.log('Start Game.');

  injectTextureCss();
  setState(createState());

  new LayerManager([
    new SimLayer(),
    new SimUiLayer(root),
    new MenuUiLayer(root),
    new GameCompleteUiLayer(root),
    new DebugLayer(),
  ]).start();
};

addEventListener('load', startGame);
