import { LINE, createSvgElement } from '../dom';
import type { Paddle } from '../model/paddle';

export type PaddleView = {
  el: SVGLineElement;
};

export const createPaddleView = (
  svg: SVGSVGElement,
  paddle: Paddle,
  color: string
): PaddleView => {
  const tip = paddle.line.b;
  const el = createSvgElement(LINE, {
    x1: String(paddle.pivot.x),
    y1: String(paddle.pivot.y),
    x2: String(tip.x),
    y2: String(tip.y),
    stroke: color,
    'stroke-width': '10',
    'stroke-linecap': 'round',
  }) as SVGLineElement;
  svg.appendChild(el);
  return { el };
};

export const drawPaddle = (view: PaddleView, paddle: Paddle) => {
  view.el.setAttribute('x1', String(paddle.pivot.x));
  view.el.setAttribute('y1', String(paddle.pivot.y));
  view.el.setAttribute('x2', String(paddle.line.b.x));
  view.el.setAttribute('y2', String(paddle.line.b.y));
};
