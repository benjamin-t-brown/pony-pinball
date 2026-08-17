import { LAYER_OFF, LAYER_ON, Layer } from './layers/Layer';
import type { StateManager } from './state/StateManager';

const DT = 1000 / 60;

export class LayerManager {
  last = performance.now();
  acc = 0;
  layers: Layer[];
  stateManager: StateManager | null;

  constructor(layers: Layer[], stateManager: StateManager | null = null) {
    this.layers = layers;
    this.stateManager = stateManager;
  }

  start() {
    this.updateRender(0);
    requestAnimationFrame(this.loop);
  }

  integrate(dt: number) {
    for (const layer of this.layers) {
      if (layer.layerState === LAYER_ON) {
        layer.update(dt);
      }
    }
  }

  updateRender(dt: number) {
    if (this.stateManager) {
      this.stateManager.update(dt);
    }
    for (let i = this.layers.length - 1; i >= 0; i--) {
      if (this.layers[i].shouldRemove()) {
        this.layers.splice(i, 1);
      }
    }
    for (const layer of this.layers) {
      if (layer.layerState === LAYER_OFF) {
        continue;
      }
      layer.render(dt);
    }
  }

  loop = (t: number) => {
    const dt = Math.min(33, t - this.last);
    this.last = t;
    this.acc += dt;
    while (this.acc >= DT) {
      this.integrate(DT);
      this.acc -= DT;
    }
    this.updateRender(dt);
    requestAnimationFrame(this.loop);
  };
}
