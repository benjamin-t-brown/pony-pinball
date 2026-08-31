import { Part } from '../Part';
import { palette, sectionBg, sectionDot } from '../../machine/MachineLook';
import {
  DEC_BLINKING_LIGHT,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
} from '../../machine/MachineCalls';

export {
  DEC_BLINKING_LIGHT,
  DEC_BLINKING_LIGHT_LINE,
  DEC_ICON,
  DEC_RAINBOW,
};

export const SHAPE_CHEVRON = 0;
export const SHAPE_CIRCLE = 1;
export const SHAPE_SQUARE = 2;

export const CHEVRON_D = 'M-6-8L6 0L-6 8';

/** Reserved: cycle the machine palette. Not `palette().length`. */
export const TEX_PALETTE = 7;
export const TEX_ARROWS = 8;

export const getTextureClass = (texture: number) => {
  const t = texture | 0;
  if (t === TEX_ARROWS) {
    return 'ta';
  }
  if (t === TEX_PALETTE) {
    return 't tc';
  }
  return 't t' + (t % palette().length);
};

export const lightAnimation = (dec: Decoration) => {
  if (!dec.active || !(dec.interval > 0)) {
    return 'none';
  }
  if ((dec.texture | 0) === TEX_PALETTE) {
    return (
      'c ' + dec.interval * palette().length + 'ms step-end infinite'
    );
  }
  return 'k ' + dec.interval + 'ms step-end infinite';
};

export const injectTextureCss = () => {
  const colors = palette();
  const bg = sectionBg();
  const dot = sectionDot();
  const rain = colors.join(',') + ',' + colors[0];
  const arrow =
    'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 14 16\'><path fill=\'%23fff\' d=\'M1 1 10 8 1 15 3 15 12 8 3 1z\'/></svg>")';
  const n = colors.length;
  let css =
    '@keyframes k{50%{opacity:0}}' +
    '@keyframes p{to{background-position:var(--s) 0;mask-position:var(--s) 0}}';
  css += '@keyframes c{';
  for (let i = 0; i < n; i++) {
    css += ((i * 100) / n | 0) + '%{stroke:' + colors[i] + '}';
  }
  css += '}.t{fill:none}.tc{stroke:' + colors[0] + '}';
  for (let i = 0; i < n; i++) {
    css += '.t' + i + '{stroke:' + colors[i] + '}';
  }
  css +=
    '.ta{overflow:hidden;position:relative;--s:20px;--r:0deg;background:' +
    bg +
    '}' +
    '.ta:before{content:"";position:absolute;left:50%;top:50%;width:100vmax;height:100vmax;' +
    'transform:translate(-50.4%,-50%) rotate(var(--r));' +
    'background:repeating-linear-gradient(90deg,' +
    rain +
    ');background-size:calc(6*var(--s)) 100%;' +
    '-webkit-mask:' +
    arrow +
    ' 0 0/var(--s) var(--s);mask:' +
    arrow +
    ' 0 0/var(--s) var(--s);animation:p .6s linear infinite}' +
    '.tr{overflow:hidden;background:repeating-linear-gradient(90deg,' +
    rain +
    ');background-size:120px 100%}' +
    '.sb{background:' +
    bg +
    ';background-image:radial-gradient(' +
    dot +
    ' 1.5px,transparent 1.5px),radial-gradient(' +
    dot +
    ' 1.5px,' +
    bg +
    ' 1.5px);background-size:20px 20px;background-position:0 0,10px 10px}';
  const prev = document.getElementById('machine-theme');
  if (prev) {
    prev.remove();
  }
  const el = document.createElement('style');
  el.id = 'machine-theme';
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
  count = 1;
  delay = 0;
  x1 = 0;
  y1 = 0;

  constructor(
    x: number,
    y: number,
    scale: number,
    rot: number,
    decorationType: number,
    texture: number,
    args: number[]
  ) {
    super(x, y);
    this.scale = scale;
    this.rot = rot;
    this.decorationType = decorationType;
    this.texture = texture;
    this.x1 = x;
    this.y1 = y;
    this.active = true;
    if (decorationType === DEC_BLINKING_LIGHT) {
      this.shape = args[0] | 0;
      if (args[1] === 0) {
        this.active = false;
      }
      this.interval = args[2] == null ? 1000 : args[2];
    }
    if (decorationType === DEC_BLINKING_LIGHT_LINE) {
      this.interval = args[0] == null ? 400 : args[0];
      this.shape = args[1] | 0;
      const n = args[2] | 0;
      this.count = n < 1 ? 1 : n;
      this.x1 = args[3];
      this.y1 = args[4];
      if (args[5] > 0) {
        this.delay = args[5];
      }
      if (args[6] === 0) {
        this.active = false;
      }
    }
    if (decorationType === DEC_ICON) {
      if (args[0] == null) {
        this.opacity = 1;
      } else if (args[0] < 0) {
        this.opacity = 0;
      } else if (args[0] > 1) {
        this.opacity = 1;
      } else {
        this.opacity = args[0];
      }
    }
    if (decorationType === DEC_RAINBOW) {
      this.x1 = args[0] > 0 ? args[0] : 80;
      this.y1 = args[1] > 0 ? args[1] : 40;
    }
  }
}

export const decorationFill = (texture: number) => {
  const colors = palette();
  return colors[(texture | 0) % colors.length];
};

export const decorationLightCount = (dec: Decoration) => {
  if (dec.decorationType === DEC_BLINKING_LIGHT_LINE) {
    return dec.count < 1 ? 1 : dec.count | 0;
  }
  return 1;
};

export const decorationLightAt = (dec: Decoration, i: number) => {
  const n = decorationLightCount(dec);
  if (dec.decorationType !== DEC_BLINKING_LIGHT_LINE) {
    return { x: dec.x, y: dec.y };
  }
  if (n <= 1) {
    return { x: (dec.x + dec.x1) * 0.5, y: (dec.y + dec.y1) * 0.5 };
  }
  const t = i / (n - 1);
  return {
    x: dec.x + (dec.x1 - dec.x) * t,
    y: dec.y + (dec.y1 - dec.y) * t,
  };
};
