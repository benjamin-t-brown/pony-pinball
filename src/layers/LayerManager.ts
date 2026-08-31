import { LAYER_OFF, LAYER_ON, Layer } from './Layer';

// Fixed sim step. Smaller = less tunneling, more CPU.
const PHYSICS_DT_MS = 4;

export class LayerManager {
  last = performance.now();
  acc = 0;
  layers: Layer[];

  constructor(layers: Layer[]) {
    this.layers = layers;
  }

  start() {
    this.updateRender(0);
    requestAnimationFrame(this.loop);
  }

  /** Physics and game rules. Runs at PHYSICS_DT_MS. */
  integrate(dt: number) {
    for (const layer of this.layers) {
      if (layer.layerState === LAYER_ON) {
        layer.update(dt);
      }
    }
  }

  /** DOM / CSS. Once per animation frame. */
  updateRender(dt: number) {
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
    while (this.acc >= PHYSICS_DT_MS) {
      this.integrate(PHYSICS_DT_MS);
      this.acc -= PHYSICS_DT_MS;
    }
    this.updateRender(dt);
    requestAnimationFrame(this.loop);
  };
}
