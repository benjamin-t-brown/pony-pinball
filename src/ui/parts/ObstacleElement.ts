import {
  CIRCLE,
  POINTER_EVENTS,
  SVG,
  TRANSFORM,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../../DomFuncs';
import { sectionBg } from '../../machine/MachineLook';
import {
  CIRCLE_DIAMOND,
  DIAMOND_D,
  circleFill,
  obstacleStroke,
  type Obstacle,
} from '../../model/parts/Obstacle';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

const addCircleGlyph = (svg: SVGSVGElement, o: Obstacle) => {
  const disc = createSvgElement(CIRCLE, {
    r: stringify(o.r),
    fill: circleFill(o.active, o.color),
  });
  svg.appendChild(disc);
  const g = createSvgElement('g', {
    transform: 'scale(' + stringify(o.r * 0.7) + ')',
  });
  if (o.icon === CIRCLE_DIAMOND) {
    g.appendChild(
      createSvgElement('path', {
        d: DIAMOND_D,
        fill: sectionBg(),
      })
    );
  } else {
    g.appendChild(
      createSvgElement(CIRCLE, {
        cx: '-.32',
        cy: '-.22',
        r: '.13',
        fill: sectionBg(),
      })
    );
    g.appendChild(
      createSvgElement(CIRCLE, {
        cx: '.32',
        cy: '-.22',
        r: '.13',
        fill: sectionBg(),
      })
    );
    g.appendChild(
      createSvgElement('path', {
        d: 'M-.4.22A.48.48 0 0 0 .4.22',
        fill: 'none',
        stroke: sectionBg(),
        'stroke-width': '.12',
        'stroke-linecap': 'round',
      })
    );
  }
  svg.appendChild(g);
  return disc;
};

export class ObstacleElement extends PartElement {
  declare part: Obstacle;
  discEl: Element | null = null;

  constructor(part: Obstacle, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const obstacle = this.part;
    this.setPos(obstacle.x, obstacle.y);
    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      overflow: 'visible',
      [POINTER_EVENTS]: 'none',
      'transform-origin': '0 0',
    });
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
    this.attach(svg as unknown as HTMLElement);
    this.render(0);
  }

  render(_dt: number) {
    const obstacle = this.part;
    if (this.el) {
      setStyle(this.el, {
        [TRANSFORM]:
          'translate(' +
          px(obstacle.x) +
          ',' +
          px(obstacle.y) +
          ') rotate(' +
          obstacle.angle +
          'rad)',
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
