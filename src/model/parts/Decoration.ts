import { PART_DECORATION, Part } from '../Part';
import { GATE_COLORS } from '../constants';

export const DEC_BLINKING_LIGHT = 0;

export const SHAPE_CHEVRON = 0;
export const SHAPE_CIRCLE = 1;
export const SHAPE_SQUARE = 2;

export const CHEVRON_D = 'M-6-8L6 0L-6 8';

export const getTextureClass = (texture: number) => {
  return 't t' + ((texture | 0) % GATE_COLORS.length);
};

export const injectTextureCss = () => {
  let css = '@keyframes k{50%{opacity:0}}.t{fill:none}';
  for (let i = 0; i < GATE_COLORS.length; i++) {
    css += '.t' + i + '{stroke:' + GATE_COLORS[i] + '}';
  }
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
};

export class Decoration extends Part {
  scale = 1;
  rot = 0;
  decorationType = 0;
  texture = 0;
  interval = 0;
  shape = 0;

  constructor(
    x: number,
    y: number,
    scale: number,
    rot: number,
    decorationType: number,
    texture: number,
    args: number[]
  ) {
    super(x, y, PART_DECORATION);
    this.scale = scale;
    this.rot = rot;
    this.decorationType = decorationType;
    this.texture = texture;
    if (decorationType === DEC_BLINKING_LIGHT) {
      if (args[0] > 0) {
        this.interval = args[0];
      }
      this.shape = args[1] | 0;
    }
  }
}
