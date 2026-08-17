import { getStateGlobal } from '../state/StateManagerInterface';
import { Board } from '../ui/Board';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '../model/widgets/Widget';
import { Layer } from './Layer';

export class SimUiLayer extends Layer {
  constructor(parent: HTMLElement) {
    super(parent, 'ui');
    this.addUiElement(new Board());
    this.onResize(
      parent.clientWidth || innerWidth,
      parent.clientHeight || innerHeight
    );
  }

  setControl(key: string, down: boolean) {
    const state = getStateGlobal();
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
