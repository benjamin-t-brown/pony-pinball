import { updateSimulation } from '../sim/updateSimulation';
import { getState } from '../state/State';
import { Layer } from './Layer';

export class SimLayer extends Layer {
  update(dt: number) {
    const state = getState();
    if (state.playing) {
      state.playMs += dt;
    }
    updateSimulation(state, dt);
  }

  render(dt: number) {
    // drawBall(this.views.ball, this.game.ball);
    // drawPaddle(this.views.leftPaddle, this.game.leftPaddle);
    // drawPaddle(this.views.rightPaddle, this.game.rightPaddle);
    // super.render(deltaTime);
  }
}
