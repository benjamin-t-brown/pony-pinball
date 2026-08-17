import {
  CIRCLE,
  SVG,
  appendChild,
  createSvgElement,
  setStyle,
} from '../dom';
import type { Ball } from '../model/ball';
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
      width: String(size),
      height: String(size),
      viewBox: '0 0 ' + size + ' ' + size,
    }) as SVGSVGElement;
    svg.appendChild(
      createSvgElement(CIRCLE, {
        'cx': String(ball.r),
        'cy': String(ball.r),
        'r': String(ball.r),
        'fill': ball.color,
      })
    );

    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      'pointer-events': 'none',
    });

    const host = this.parent && this.parent.el;
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
        left: this.x + 'px',
        top: this.y + 'px',
      });
    }
  }
}
