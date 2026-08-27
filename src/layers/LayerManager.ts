import { LAYER_OFF, LAYER_ON, Layer } from './Layer';

// the smaller this is, the smaller the physics step and
// less chance the ball phases through walls, but more cpu power used
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

  integrate(dt: number) {
    for (const layer of this.layers) {
      if (layer.layerState === LAYER_ON) {
        layer.update(dt);
      }
    }
  }

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
