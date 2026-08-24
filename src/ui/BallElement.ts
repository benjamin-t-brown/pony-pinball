import {
  CIRCLE,
  POINTER_EVENTS,
  SVG,
  appendChild,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../dom';
import type { Ball } from '../model/Ball';
import { UiElement } from './UiElement';

export class BallElement extends UiElement {
  ball: Ball;
  circleEl: SVGElement | null = null;

  constructor(ball: Ball, parent?: UiElement) {
    super(parent);
    this.ball = ball;
  }

  build() {
    const ball = this.ball;
    const size = ball.r * 2;
    this.width = size;
    this.height = size;

    const svg = createSvgElement(SVG, {
      width: stringify(size),
      height: stringify(size),
      viewBox: '0 0 ' + size + ' ' + size,
    }) as SVGSVGElement;
    const circle = createSvgElement(CIRCLE, {
      cx: stringify(ball.r),
      cy: stringify(ball.r),
      r: stringify(ball.r),
      fill: ball.color,
      'fill-opacity': '0.75',
    });
    svg.appendChild(circle);
    this.circleEl = circle;

    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      [POINTER_EVENTS]: 'none',
    });

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, svg as unknown as HTMLElement);
    }
    this.el = svg as unknown as HTMLElement;
    this.syncPos();
  }

  update(_dt: number) {
    this.syncPos();
  }

  render(_dt: number) {}

  syncPos() {
    const ball = this.ball;
    const size = ball.r * 2;
    this.width = size;
    this.height = size;
    this.x = ball.pos.x - ball.r;
    this.y = ball.pos.y - ball.r;
    if (this.el) {
      const sizeStr = stringify(size);
      setAttribute(this.el, 'width', sizeStr);
      setAttribute(this.el, 'height', sizeStr);
      setAttribute(this.el, 'viewBox', '0 0 ' + sizeStr + ' ' + sizeStr);
      setStyle(this.el, {
        left: px(this.x),
        top: px(this.y),
      });
    }
    if (this.circleEl) {
      const r = stringify(ball.r);
      const el = this.circleEl as unknown as HTMLElement;
      setAttribute(el, 'cx', r);
      setAttribute(el, 'cy', r);
      setAttribute(el, 'r', r);
      setAttribute(el, 'fill', ball.color);
    }
  }
}
