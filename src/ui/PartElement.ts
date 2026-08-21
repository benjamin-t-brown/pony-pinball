import {
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
import type { Collectable } from '../model/parts/Collectable';
import type { Field } from '../model/parts/Field';
import type { Launcher } from '../model/parts/Launcher';
import type { Obstacle } from '../model/parts/Obstacle';
import type { Paddle } from '../model/parts/Paddle';
import {
  PART_COLLECTABLE,
  PART_FIELD,
  PART_LAUNCHER,
  PART_PADDLE,
  type Part,
} from '../model/Part';
import { UiElement } from './UiElement';

export class PartElement extends UiElement {
  part: Part;
  lineEls: SVGLineElement[] = [];

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
        background: '#fc8',
        [POINTER_EVENTS]: 'none',
      });
      this.attach(el);
      this.render(0);
      return;
    }

    if (part.type === PART_FIELD) {
      const field = part as Field;
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
      if (!field.trigger && field.grav === 0 && forceLen > 0) {
        const svg = createSvgElement(SVG, {
          width: stringify(field.w),
          height: stringify(field.h),
        }) as SVGSVGElement;
        setStyle(svg as unknown as HTMLElement, {
          position: 'absolute',
          inset: '0',
          overflow: 'visible',
          [POINTER_EVENTS]: 'none',
        });
        const nx = field.ax / forceLen;
        const ny = field.ay / forceLen;
        const cx = field.w / 2;
        const cy = field.h / 2;
        const len = 28;
        const head = 10;
        const tipX = cx + nx * len;
        const tipY = cy + ny * len;
        const bx = tipX - nx * head;
        const by = tipY - ny * head;
        const pxOff = -ny * head * 0.65;
        const pyOff = nx * head * 0.65;
        this.addLine(svg, cx - nx * len, cy - ny * len, tipX, tipY, '#fc8', '3');
        this.addLine(svg, tipX, tipY, bx + pxOff, by + pyOff, '#fc8', '3');
        this.addLine(svg, tipX, tipY, bx - pxOff, by - pyOff, '#fc8', '3');
        appendChild(el, svg as unknown as HTMLElement);
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
      this.addLine(svg, 0, 0, 0, 0, '#fc8', '8');
    } else {
      const walls = (part as Obstacle).walls;
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        this.addLine(svg, w.a.x, w.a.y, w.b.x, w.b.y, '#888', '4');
      }
    }

    this.attach(svg as unknown as HTMLElement);
  }

  update(_dt: number) {
    const part = this.part;
    const first = this.lineEls[0] as unknown as HTMLElement;

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
      const field = part as Field;
      const conveyer = !field.trigger && field.grav === 0;
      let bg = conveyer ? 'rgba(180,140,40,0.08)' : 'rgba(70,140,220,0.08)';
      if (field.active) {
        if (conveyer) {
          bg = field.inside
            ? 'rgba(240,200,80,0.4)'
            : 'rgba(200,160,50,0.22)';
        } else {
          bg = field.inside
            ? 'rgba(120,200,255,0.35)'
            : 'rgba(70,160,255,0.18)';
        }
      }
      if (this.el) {
        setStyle(this.el, { background: bg });
      }
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
    const stroke = obstacle.active ? '#fc8' : '#888';
    for (let i = 0; i < this.lineEls.length; i++) {
      setAttribute(this.lineEls[i] as unknown as HTMLElement, 'stroke', stroke);
    }
  }
}
