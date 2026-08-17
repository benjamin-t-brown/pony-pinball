import {
  DIV,
  LINE,
  SVG,
  appendChild,
  createElement,
  createSvgElement,
  getGameRoot,
  removeChild,
  setStyle,
} from '../dom';
import { getStateGlobal } from '../state/StateManagerInterface';
import type { Ball } from '../model/ball';
import { BallElement } from './BallElement';
import { UiElement } from './UiElement';

export class Board extends UiElement {
  el: HTMLElement | null = null;
  svg: SVGSVGElement | null = null;
  balls: BallElement[] = [];

  constructor() {
    super();
    this.setId('board');
  }

  addBall(ball: Ball) {
    const el = new BallElement(ball);
    this.addChild(el);
    if (this.el) {
      el.build();
    }
    return el;
  }

  getBallElements() {
    return this.balls;
  }

  removeBall(ball: BallElement) {
    const i = this.balls.indexOf(ball);
    if (i < 0) {
      return;
    }
    this.removeChildAtIndex(this.children.indexOf(ball));
  }

  syncBalls() {
    const state = getStateGlobal();
    for (const ball of state.balls) {
      if (!this.balls.some(el => el.ball === ball)) {
        this.addBall(ball);
      }
    }
    for (const el of this.balls.slice()) {
      if (state.balls.indexOf(el.ball) < 0) {
        this.removeBall(el);
      }
    }
  }

  addChild(child: UiElement) {
    super.addChild(child);
    if (child instanceof BallElement && this.balls.indexOf(child) < 0) {
      this.balls.push(child);
    }
  }

  removeChildAtIndex(index: number) {
    const child = this.children[index];
    if (child instanceof BallElement) {
      const i = this.balls.indexOf(child);
      if (i >= 0) {
        this.balls.splice(i, 1);
      }
    }
    if (child && child.el && this.el) {
      removeChild(this.el, child.el);
    }
    super.removeChildAtIndex(index);
  }

  build() {
    const state = getStateGlobal();
    this.width = state.width;
    this.height = state.height;

    const root = getGameRoot();
    if (!root) {
      return;
    }
    const el = createElement(DIV);
    setStyle(el, {
      position: 'relative',
      width: state.width + 'px',
      height: state.height + 'px',
      background: '#555',
    });
    appendChild(root, el);

    const svg = createSvgElement(SVG, {
      width: String(state.width),
      height: String(state.height),
      viewBox: '0 0 ' + state.width + ' ' + state.height,
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      inset: '0',
    });
    appendChild(el, svg as unknown as HTMLElement);

    for (const wall of state.walls) {
      svg.appendChild(
        createSvgElement(LINE, {
          x1: String(wall.a.x),
          y1: String(wall.a.y),
          x2: String(wall.b.x),
          y2: String(wall.b.y),
          stroke: '#888',
          'stroke-width': '4',
          'stroke-linecap': 'round',
        })
      );
    }

    this.el = el;
    this.svg = svg;
    this.syncBalls();
  }

  update(dt: number) {
    this.syncBalls();
    super.update(dt);
  }

  render(_dt: number) {}
}
