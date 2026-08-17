import {
  LINE,
  SVG,
  TRANSFORM,
  appendChild,
  createSvgElement,
  setAttribute,
  setStyle,
} from '../dom';
import type { Obstacle } from '../model/obstacles/Obstacle';
import { UiElement } from './UiElement';

export class ObstacleElement extends UiElement {
  obstacle: Obstacle;
  lineEls: SVGLineElement[] = [];

  constructor(obstacle: Obstacle, parent?: UiElement) {
    super(parent);
    this.obstacle = obstacle;
  }

  build() {
    const obstacle = this.obstacle;
    this.setPos(obstacle.x, obstacle.y);

    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: obstacle.x + 'px',
      top: obstacle.y + 'px',
      overflow: 'visible',
      'pointer-events': 'none',
    });

    for (let i = 0; i < obstacle.walls.length; i++) {
      const w = obstacle.walls[i];
      const lineEl = createSvgElement(LINE, {
        x1: String(w.a.x),
        y1: String(w.a.y),
        x2: String(w.b.x),
        y2: String(w.b.y),
        stroke: '#888',
        'stroke-width': '4',
        'stroke-linecap': 'round',
      }) as SVGLineElement;
      svg.appendChild(lineEl);
      this.lineEls.push(lineEl);
    }

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, svg as unknown as HTMLElement);
    }
    this.el = svg as unknown as HTMLElement;
  }

  render(_dt: number) {
    const obstacle = this.obstacle;
    if (this.el) {
      setStyle(this.el, {
        left: obstacle.x + 'px',
        top: obstacle.y + 'px',
        'transform-origin': '0 0',
        [TRANSFORM]: 'rotate(' + obstacle.angle + 'rad)',
      });
    }
    const stroke = obstacle.active ? '#fc8' : '#888';
    for (let i = 0; i < this.lineEls.length; i++) {
      setAttribute(
        this.lineEls[i] as unknown as HTMLElement,
        'stroke',
        stroke
      );
    }
  }
}
