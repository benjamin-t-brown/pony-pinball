import { getState } from '../state/State';
import { Board } from '../ui/Board';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '../model/Part';
import { Layer } from './Layer';

export class SimUiLayer extends Layer {
  constructor(parent: HTMLElement) {
    super(parent);
    this.addUiElement(new Board());
    this.onResize(
      parent.clientWidth || innerWidth,
      parent.clientHeight || innerHeight
    );
  }

  setControl(key: string, down: boolean) {
    const state = getState();
    if (key === 'KeyZ' || key === 'ArrowLeft') {
      state.input[CONTROL_LEFT] = down;
    } else if (key === 'Slash' || key === 'ArrowRight') {
      state.input[CONTROL_RIGHT] = down;
    } else if (key === 'Space' || key === 'Enter') {
      state.input[CONTROL_START] = down;
    }
  }

  onKeyDown(key: string, _keyCode: number) {
    this.setControl(key, true);
  }

  onKeyUp(key: string, _keyCode: number) {
    this.setControl(key, false);
  }
}
