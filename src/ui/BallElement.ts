import {
  CIRCLE,
  POINTER_EVENTS,
  SVG,
  appendChild,
  createSvgElement,
  px,
  setStyle,
  stringify,
} from '../dom';
import type { Ball } from '../model/Ball';
import { UiElement } from './UiElement';

export class BallElement extends UiElement {
  ball: Ball;

  constructor(ball: Ball, parent?: UiElement) {
    super(parent);
    this.ball = ball;
    this.setId('ball');
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
    svg.appendChild(
      createSvgElement(CIRCLE, {
        'cx': stringify(ball.r),
        'cy': stringify(ball.r),
        'r': stringify(ball.r),
        'fill': ball.color,
      })
    );

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
    this.x = ball.pos.x - ball.r;
    this.y = ball.pos.y - ball.r;
    if (this.el) {
      setStyle(this.el, {
        left: px(this.x),
        top: px(this.y),
      });
    }
  }
}
