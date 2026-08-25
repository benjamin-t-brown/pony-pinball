import { PART_DECORATION, Part } from '../Part';
import { GATE_COLORS, SECTION_BG, SECTION_DOT } from '../constants';

export const DEC_BLINKING_LIGHT = 0;
export const DEC_BLINKING_LIGHT_LINE = 1;
export const DEC_ICON = 2;
export const DEC_RAINBOW = 3;

export const SHAPE_CHEVRON = 0;
export const SHAPE_CIRCLE = 1;
export const SHAPE_SQUARE = 2;

export const ICON_WAND = 0;
export const ICON_HAT = 1;
export const ICON_PONY = 2;

export const CHEVRON_D = 'M-6-8L6 0L-6 8';
export const WAND_D = 'M-6.5 8-4.6 9.6 4.2-4.8 2.3-6.4Z';
export const HAT_D = 'M0-8.5 7.5 5Q0 12-7.5 5Z';
export const PONY_D =
  'M8-9 2-4 3.2-1 2.2 1.5 4 3.6 1.4 5.6 2.4 8.5H-3.2L-4.2 5.6-2.2 3.8-5.6 4.8-8.2 7.8-8.8 4.8-5.8 2-7.6.2-5-1.8-3.2-5-.2-3.6 2.4-6.8 5.2-6 6.4-8.8Z';

export const TEX_PALETTE = GATE_COLORS.length;
export const TEX_ARROWS = GATE_COLORS.length + 1;

export const getTextureClass = (texture: number) => {
  const t = texture | 0;
  if (t === TEX_ARROWS) {
    return 'ta';
  }
  if (t === TEX_PALETTE) {
    return 't tc';
  }
  return 't t' + (t % GATE_COLORS.length);
};

export const lightAnimation = (dec: Decoration) => {
  if (!dec.active || !(dec.interval > 0)) {
    return 'none';
  }
  if ((dec.texture | 0) === TEX_PALETTE) {
    return (
      'c ' + dec.interval * GATE_COLORS.length + 'ms step-end infinite'
    );
  }
  return 'k ' + dec.interval + 'ms step-end infinite';
};

export const injectTextureCss = () => {
  const rain = '#f66,#fa6,#fc8,#6c6,#8cf,#c8f,#f66';
  const arrow =
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 14 16\'%3E%3Cpath fill=\'%23fff\' d=\'M1 1 10 8 1 15 3 15 12 8 3 1z\'/%3E%3C/svg%3E")';
  const n = GATE_COLORS.length;
  let css =
    '@keyframes k{50%{opacity:0}}' +
    '@keyframes p{to{background-position:var(--s) 0;-webkit-mask-position:var(--s) 0;mask-position:var(--s) 0}}';
  css += '@keyframes c{';
  for (let i = 0; i < n; i++) {
    css += ((i * 100) / n | 0) + '%{stroke:' + GATE_COLORS[i] + '}';
  }
  css += '}.t{fill:none}.tc{stroke:' + GATE_COLORS[0] + '}';
  for (let i = 0; i < n; i++) {
    css += '.t' + i + '{stroke:' + GATE_COLORS[i] + '}';
  }
  css +=
    '.ta{overflow:hidden;position:relative;--s:20px;--r:0deg;background:' +
    SECTION_BG +
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
    '.tr{overflow:hidden;--s:-120px;background:repeating-linear-gradient(90deg,' +
    rain +
    ');background-size:120px 100%;animation:p 3.6s linear infinite}' +
    '.sb{background:' +
    SECTION_BG +
    ';background-image:radial-gradient(' +
    SECTION_DOT +
    ' 1.5px,transparent 1.5px),radial-gradient(' +
    SECTION_DOT +
    ' 1.5px,' +
    SECTION_BG +
    ' 1.5px);background-size:20px 20px;background-position:0 0,10px 10px}';
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
  count = 1;
  delay = 0;
  x1 = 0;
  y1 = 0;
  opacity = 1;

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
      this.shape = args[0] | 0;
      if (args[1] == null) {
        this.opacity = 1;
      } else if (args[1] < 0) {
        this.opacity = 0;
      } else if (args[1] > 1) {
        this.opacity = 1;
      } else {
        this.opacity = args[1];
      }
    }
    if (decorationType === DEC_RAINBOW) {
      this.x1 = args[0] > 0 ? args[0] : 80;
      this.y1 = args[1] > 0 ? args[1] : 40;
    }
  }
}

export const decorationFill = (texture: number) => {
  return GATE_COLORS[(texture | 0) % GATE_COLORS.length];
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
