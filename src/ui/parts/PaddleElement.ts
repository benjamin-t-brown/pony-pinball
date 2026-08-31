import {
  POINTER_EVENTS,
  SVG,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../../DomFuncs';
import type { Paddle } from '../../model/parts/Paddle';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

export class PaddleElement extends PartElement {
  declare part: Paddle;

  constructor(part: Paddle, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const paddle = this.part;
    this.setPos(paddle.x, paddle.y);
    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: px(paddle.x),
      top: px(paddle.y),
      overflow: 'visible',
      [POINTER_EVENTS]: 'none',
    });
    const line = paddle.getLine();
    this.addLine(
      svg,
      0,
      0,
      line.b.x - line.a.x,
      line.b.y - line.a.y,
      '#ccc',
      '6'
    );
    this.attach(svg as unknown as HTMLElement);
    this.render(0);
  }

  render(_dt: number) {
    const first = this.lineEls[0] as unknown as HTMLElement;
    if (!first) {
      return;
    }
    const line = this.part.getLine();
    setAttribute(first, 'x2', stringify(line.b.x - line.a.x));
    setAttribute(first, 'y2', stringify(line.b.y - line.a.y));
  }
}
