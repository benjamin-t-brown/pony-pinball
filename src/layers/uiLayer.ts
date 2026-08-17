import type { GameState } from '../model/gameState';
import {
  bindPaddleControls,
  type PaddleControls,
} from '../ui/paddleControls';
import type { Layer } from './types';

export const createUiLayer = (
  state: GameState,
  controls: PaddleControls
): Layer => {
  bindPaddleControls(controls, state.input);

  return {
    name: 'ui',
    // Input is event-driven via bindPaddleControls; kept for layer symmetry.
    input: () => {},
    draw: () => {},
  };
};
