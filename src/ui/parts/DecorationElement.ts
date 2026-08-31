import {
  CIRCLE,
  DIV,
  POINTER_EVENTS,
  SVG,
  TRANSFORM,
  createElement,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../../DomFuncs';
import {
  CHEVRON_D,
  DEC_ICON,
  DEC_RAINBOW,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
  decorationFill,
  decorationLightAt,
  decorationLightCount,
  getTextureClass,
  lightAnimation,
  type Decoration,
} from '../../model/parts/Decoration';
import { STAR_D } from '../../model/parts/Obstacle';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

const addDecorationShape = (g: SVGElement, shape: number) => {
  if (shape === SHAPE_CIRCLE) {
    g.appendChild(
      createSvgElement(CIRCLE, {
        r: '8',
        'stroke-width': '3',
      })
    );
    return;
  }
  if (shape === SHAPE_SQUARE) {
    g.appendChild(
      createSvgElement('rect', {
        x: '-8',
        y: '-8',
        width: '16',
        height: '16',
        'stroke-width': '3',
      })
    );
    return;
  }
  g.appendChild(
    createSvgElement('path', {
      d: CHEVRON_D,
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })
  );
};

const addDecorationIcon = (g: SVGElement, dec: Decoration) => {
  g.appendChild(
    createSvgElement('path', {
      d: STAR_D,
      fill: decorationFill(dec.texture),
      transform: 'scale(9)',
    })
  );
};

const syncDecorationLight = (wrap: Element, dec: Decoration) => {
  setAttribute(
    wrap as unknown as HTMLElement,
    'opacity',
    dec.active ? '1' : '0.2'
  );
  const anim = lightAnimation(dec);
  const kids = wrap.children;
  for (let i = 0; i < kids.length; i++) {
    const g = kids[i] as unknown as HTMLElement;
    const style: Record<string, string> = {
      animation: anim,
    };
    style['animation-delay'] =
      dec.delay && anim !== 'none' ? stringify(i * dec.delay) + 'ms' : '0ms';
    setStyle(g, style);
  }
};

export class DecorationElement extends PartElement {
  declare part: Decoration;
  lightWrap: Element | null = null;
  lightOn = true;

  constructor(part: Decoration, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const dec = this.part;
    this.setPos(dec.x, dec.y);
    if (dec.decorationType === DEC_RAINBOW) {
      const el = createElement(DIV);
      el.className = 'tr';
      setStyle(el, {
        position: 'absolute',
        left: px(dec.x),
        top: px(dec.y),
        width: px(dec.x1),
        height: px(dec.y1),
        [TRANSFORM]:
          'rotate(' + stringify((dec.rot * 180) / Math.PI) + 'deg)',
        'transform-origin': '0 0',
        [POINTER_EVENTS]: 'none',
      });
      this.attach(el);
      return;
    }
    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: '0',
      top: '0',
      overflow: 'visible',
      [POINTER_EVENTS]: 'none',
    });
    const wrap = createSvgElement('g', {});
    if (dec.decorationType === DEC_ICON) {
      const g = createSvgElement('g', {
        transform:
          'translate(' +
          stringify(dec.x) +
          ' ' +
          stringify(dec.y) +
          ') rotate(' +
          stringify((dec.rot * 180) / Math.PI) +
          ') scale(' +
          stringify(dec.scale) +
          ')',
      });
      addDecorationIcon(g, dec);
      wrap.appendChild(g);
      svg.appendChild(wrap);
      this.attach(svg as unknown as HTMLElement);
      return;
    }
    const n = decorationLightCount(dec);
    const rot = stringify((dec.rot * 180) / Math.PI);
    const sc = stringify(dec.scale);
    for (let i = 0; i < n; i++) {
      const p = decorationLightAt(dec, i);
      const g = createSvgElement('g', {
        transform:
          'translate(' +
          stringify(p.x) +
          ' ' +
          stringify(p.y) +
          ') rotate(' +
          rot +
          ') scale(' +
          sc +
          ')',
        class: getTextureClass(dec.texture),
      });
      addDecorationShape(g, dec.shape);
      wrap.appendChild(g);
    }
    svg.appendChild(wrap);
    this.lightWrap = wrap;
    this.lightOn = dec.active;
    syncDecorationLight(wrap, dec);
    this.attach(svg as unknown as HTMLElement);
  }

  render(_dt: number) {
    const wrap = this.lightWrap;
    if (!wrap) {
      return;
    }
    const dec = this.part;
    if (this.lightOn === dec.active) {
      return;
    }
    this.lightOn = dec.active;
    syncDecorationLight(wrap, dec);
  }
}
