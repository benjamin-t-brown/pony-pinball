import {
  CIRCLE,
  DIV,
  LINE,
  POINTER_EVENTS,
  SVG,
  TRANSFORM,
  appendChild,
  createElement,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../dom';
import { GATE_COLORS } from '../model/builders';
import { ACCENT, SECTION_BG } from '../model/constants';
import type { Collectable } from '../model/parts/Collectable';
import {
  CHEVRON_D,
  DEC_ICON,
  DEC_RAINBOW,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
  TEX_ARROWS,
  decorationFill,
  decorationLightAt,
  decorationLightCount,
  getTextureClass,
  lightAnimation,
  type Decoration,
} from '../model/parts/Decoration';
import type { Field } from '../model/parts/Field';
import type { Launcher } from '../model/parts/Launcher';
import {
  CIRCLE_DIAMOND,
  CIRCLE_STAR,
  DIAMOND_D,
  STAR_D,
  circleFill,
  obstacleStroke,
  type Obstacle,
} from '../model/parts/Obstacle';
import type { Paddle } from '../model/parts/Paddle';
import type { Portal } from '../model/parts/Portal';
import {
  PART_COLLECTABLE,
  PART_DECORATION,
  PART_FIELD,
  PART_LAUNCHER,
  PART_PADDLE,
  PART_PORTAL,
  type Part,
} from '../model/Part';
import { UiElement } from './UiElement';

const addPortalMouth = (
  host: SVGSVGElement,
  cx: number,
  cy: number,
  r: number,
  fill: string
) => {
  const rx = r * 0.55;
  const ry = r;
  const g = createSvgElement('g', {
    transform: 'translate(' + stringify(cx) + ' ' + stringify(cy) + ')',
  });
  g.appendChild(
    createSvgElement('ellipse', {
      cx: '0',
      cy: '0',
      rx: stringify(rx),
      ry: stringify(ry),
      fill,
      stroke: '#fff',
      'stroke-width': '2',
    })
  );
  const spin = createSvgElement('g');
  spin.appendChild(
    createSvgElement('ellipse', {
      cx: '0',
      cy: '0',
      rx: stringify(rx * 0.35),
      ry: stringify(ry * 0.7),
      fill: 'none',
      stroke: '#000',
      'stroke-width': '1.5',
    })
  );
  g.appendChild(spin);
  host.appendChild(g);
  return spin;
};

const addDecorationShape = (g: SVGElement, shape: number) => {
  if (shape === SHAPE_CIRCLE) {
    g.appendChild(
      createSvgElement(CIRCLE, {
        'r': '8',
        'stroke-width': '3',
      })
    );
    return;
  }
  if (shape === SHAPE_SQUARE) {
    g.appendChild(
      createSvgElement('rect', {
        'x': '-8',
        'y': '-8',
        width: '16',
        height: '16',
        'stroke-width': '3',
      })
    );
    return;
  }
  g.appendChild(
    createSvgElement('path', {
      'd': CHEVRON_D,
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })
  );
};

const addDecorationIcon = (g: SVGElement, dec: Decoration) => {
  g.appendChild(
    createSvgElement('path', {
      'd': STAR_D,
      fill: decorationFill(dec.texture),
      transform: 'scale(9)',
    })
  );
};

const syncDecorationLight = (wrap: Element, dec: Decoration) => {
  setAttribute(wrap as unknown as HTMLElement, 'opacity', dec.active ? '1' : '0.2');
  const anim = lightAnimation(dec);
  const kids = wrap.children;
  for (let i = 0; i < kids.length; i++) {
    const g = kids[i] as unknown as HTMLElement;
    const style: Record<string, string> = {
      'animation': anim,
    };
    if (dec.delay && anim !== 'none') {
      style['animation-delay'] = stringify(i * dec.delay) + 'ms';
    } else {
      style['animation-delay'] = '0ms';
    }
    setStyle(g, style);
  }
};

const addCircleGlyph = (svg: SVGSVGElement, o: Obstacle) => {
  const disc = createSvgElement(CIRCLE, {
    r: stringify(o.r),
    fill: circleFill(o.active, o.color),
  });
  svg.appendChild(disc);
  const g = createSvgElement('g', {
    transform: 'scale(' + stringify(o.r * 0.7) + ')',
  });
  const icon = o.icon % 3;
  if (icon === CIRCLE_STAR) {
    g.appendChild(
      createSvgElement('path', {
        'd': STAR_D,
        fill: SECTION_BG,
      })
    );
  } else if (icon === CIRCLE_DIAMOND) {
    g.appendChild(
      createSvgElement('path', {
        'd': DIAMOND_D,
        fill: SECTION_BG,
      })
    );
  } else {
    g.appendChild(
      createSvgElement(CIRCLE, {
        cx: '-.32',
        cy: '-.22',
        r: '.13',
        fill: SECTION_BG,
      })
    );
    g.appendChild(
      createSvgElement(CIRCLE, {
        cx: '.32',
        cy: '-.22',
        r: '.13',
        fill: SECTION_BG,
      })
    );
    g.appendChild(
      createSvgElement('path', {
        'd': 'M-.4.22A.48.48 0 0 0 .4.22',
        fill: 'none',
        stroke: SECTION_BG,
        'stroke-width': '.12',
        'stroke-linecap': 'round',
      })
    );
  }
  svg.appendChild(g);
  return disc;
};

export class PartElement extends UiElement {
  part: Part;
  lineEls: SVGLineElement[] = [];
  spiralEls: SVGElement[] = [];
  lightWrap: Element | null = null;
  lightOn = true;
  discEl: Element | null = null;

  constructor(part: Part, parent?: UiElement) {
    super(parent);
    this.part = part;
  }

  attach(el: HTMLElement) {
    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, el);
    }
    this.el = el;
  }

  addLine(
    host: SVGSVGElement,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
    width: string
  ) {
    const el = createSvgElement(LINE, {
      x1: stringify(x1),
      y1: stringify(y1),
      x2: stringify(x2),
      y2: stringify(y2),
      stroke,
      'stroke-width': width,
      'stroke-linecap': 'round',
    }) as SVGLineElement;
    host.appendChild(el);
    this.lineEls.push(el);
  }

  build() {
    const part = this.part;
    this.setPos(part.x, part.y);

    if (part.type === PART_PORTAL) {
      const portal = part as Portal;
      const fill = GATE_COLORS[portal.color] || GATE_COLORS[0];
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
      this.spiralEls.push(addPortalMouth(svg, portal.x, portal.y, portal.r, fill));
      this.spiralEls.push(
        addPortalMouth(svg, portal.x2, portal.y2, portal.r, fill)
      );
      this.attach(svg as unknown as HTMLElement);
      this.render(0);
      return;
    }

    if (part.type === PART_COLLECTABLE) {
      const coin = part as Collectable;
      const d = coin.r * 2;
      const el = createElement(DIV);
      setStyle(el, {
        position: 'absolute',
        left: px(coin.x - coin.r),
        top: px(coin.y - coin.r),
        width: px(d),
        height: px(d),
        'border-radius': '50%',
        background: ACCENT,
        [POINTER_EVENTS]: 'none',
      });
      this.attach(el);
      this.render(0);
      return;
    }

    if (part.type === PART_DECORATION) {
      const dec = part as Decoration;
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
          'opacity': stringify(dec.opacity),
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
          'class': getTextureClass(dec.texture),
        });
        addDecorationShape(g, dec.shape);
        wrap.appendChild(g);
      }
      svg.appendChild(wrap);
      this.lightWrap = wrap;
      this.lightOn = dec.active;
      syncDecorationLight(wrap, dec);
      this.attach(svg as unknown as HTMLElement);
      return;
    }

    if (part.type === PART_FIELD) {
      const field = part as Field;
      if (field.trigger) {
        return;
      }
      this.width = field.w;
      this.height = field.h;
      const el = createElement(DIV);
      setStyle(el, {
        position: 'absolute',
        left: px(field.x),
        top: px(field.y),
        width: px(field.w),
        height: px(field.h),
        [POINTER_EVENTS]: 'none',
      });
      const forceLen = Math.hypot(field.ax, field.ay);
      if (field.grav === 0 && forceLen > 0) {
        el.className = getTextureClass(TEX_ARROWS);
        setStyle(el, {
          '--r':
            stringify((Math.atan2(field.ay, field.ax) * 180) / Math.PI) + 'deg',
        });
      }
      this.attach(el);
      this.render(0);
      return;
    }

    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: px(part.x),
      top: px(part.y),
      overflow: 'visible',
      [POINTER_EVENTS]: 'none',
    });

    if (part.type === PART_PADDLE) {
      const line = (part as Paddle).getLine();
      this.addLine(
        svg,
        0,
        0,
        line.b.x - line.a.x,
        line.b.y - line.a.y,
        '#ccc',
        '6'
      );
    } else if (part.type === PART_LAUNCHER) {
      const launcher = part as Launcher;
      const dir = launcher.dir;
      const drawLen = launcher.len;
      this.addLine(
        svg,
        0,
        0,
        -dir.x * drawLen,
        -dir.y * drawLen,
        '#c84',
        '8'
      );
      this.addLine(svg, 0, 0, 0, 0, ACCENT, '8');
    } else {
      const obstacle = part as Obstacle;
      if (obstacle.isCircle) {
        this.discEl = addCircleGlyph(svg, obstacle);
      }
      const walls = obstacle.walls;
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        this.addLine(
          svg,
          w.a.x,
          w.a.y,
          w.b.x,
          w.b.y,
          obstacleStroke(obstacle),
          '4'
        );
      }
    }

    this.attach(svg as unknown as HTMLElement);
  }

  update(_dt: number) {
    const part = this.part;
    const first = this.lineEls[0] as unknown as HTMLElement;

    if (part.type === PART_PORTAL) {
      const portal = part as Portal;
      const deg = (portal.angle * 180) / Math.PI;
      for (let i = 0; i < this.spiralEls.length; i++) {
        setAttribute(
          this.spiralEls[i] as unknown as HTMLElement,
          'transform',
          'rotate(' + stringify(deg) + ')'
        );
      }
      return;
    }

    if (part.type === PART_COLLECTABLE) {
      const coin = part as Collectable;
      if (this.el) {
        setStyle(this.el, {
          display: coin.taken ? 'none' : 'block',
          left: px(coin.x - coin.r),
          top: px(coin.y - coin.r),
        });
      }
      return;
    }

    if (part.type === PART_DECORATION) {
      const wrap = this.lightWrap;
      if (!wrap) {
        return;
      }
      const dec = part as Decoration;
      if (this.lightOn === dec.active) {
        return;
      }
      this.lightOn = dec.active;
      syncDecorationLight(wrap, dec);
      return;
    }

    if (part.type === PART_PADDLE) {
      if (first) {
        const line = (part as Paddle).getLine();
        setAttribute(first, 'x2', stringify(line.b.x - line.a.x));
        setAttribute(first, 'y2', stringify(line.b.y - line.a.y));
      }
      return;
    }

    if (part.type === PART_LAUNCHER) {
      const launcher = part as Launcher;
      const fill = this.lineEls[1] as unknown as HTMLElement;
      if (first) {
        setAttribute(first, 'stroke', '#c84');
        setAttribute(first, 'x2', stringify(-launcher.dir.x * launcher.len));
        setAttribute(first, 'y2', stringify(-launcher.dir.y * launcher.len));
      }
      if (fill) {
        const t = launcher.getChargeT();
        const len = launcher.len * t;
        setAttribute(fill, 'x2', stringify(-launcher.dir.x * len));
        setAttribute(fill, 'y2', stringify(-launcher.dir.y * len));
        setAttribute(fill, 'stroke', t >= 1 ? '#fc8' : '#fa6');
      }
      return;
    }

    if (part.type === PART_FIELD) {
      return;
    }

    const obstacle = part as Obstacle;
    if (this.el) {
      setStyle(this.el, {
        left: px(obstacle.x),
        top: px(obstacle.y),
        'transform-origin': '0 0',
        [TRANSFORM]: 'rotate(' + obstacle.angle + 'rad)',
      });
    }
    const stroke = obstacleStroke(obstacle);
    if (this.discEl) {
      setAttribute(
        this.discEl as unknown as HTMLElement,
        'fill',
        circleFill(obstacle.active, obstacle.color)
      );
    }
    for (let i = 0; i < this.lineEls.length; i++) {
      setAttribute(this.lineEls[i] as unknown as HTMLElement, 'stroke', stroke);
    }
  }
}
