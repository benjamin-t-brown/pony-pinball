import type { Layer } from './layers/types';

export type LayerManager = {
  start: () => void;
};

export const createLayerManager = (layers: Layer[]): LayerManager => {
  let last = performance.now();

  const step = (dt: number) => {
    for (const layer of layers) {
      layer.input?.();
    }
    for (const layer of layers) {
      layer.update?.(dt);
    }
    for (const layer of layers) {
      layer.draw?.();
    }
  };

  const loop = (t: number) => {
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    step(dt);
    requestAnimationFrame(loop);
  };

  return {
    start: () => {
      step(0);
      requestAnimationFrame(loop);
    },
  };
};
