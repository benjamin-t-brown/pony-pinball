import { updateSimulation } from '../sim/updateSimulation';
import { getStateGlobal } from '../state/StateManagerInterface';
import { Layer } from './Layer';

export class SimLayer extends Layer {
  constructor() {
    super(null, 'sim');
  }

  update(dt: number) {
    const state = getStateGlobal();
    updateSimulation(state, dt);
  }

  render(dt: number) {
    // drawBall(this.views.ball, this.game.ball);
    // drawPaddle(this.views.leftPaddle, this.game.leftPaddle);
    // drawPaddle(this.views.rightPaddle, this.game.rightPaddle);
    // super.render(deltaTime);
  }
}
