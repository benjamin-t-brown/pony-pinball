import { Board } from '../ui/Board';
import { Layer } from './Layer';

export class SimUiLayer extends Layer {
  constructor(parent: HTMLElement) {
    super(parent, 'ui');
    this.addUiElement(new Board());
  }
}
