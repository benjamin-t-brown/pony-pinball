import {
  POINTER_EVENTS,
  SVG,
  createSvgElement,
  setAttribute,
  setStyle,
  stringify,
} from '../../DomFuncs';
import { palette } from '../../machine/MachineLook';
import type { Portal } from '../../model/parts/Portal';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

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

export class PortalElement extends PartElement {
  declare part: Portal;
  spiralEls: SVGElement[] = [];

  constructor(part: Portal, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const portal = this.part;
    this.setPos(portal.x, portal.y);
    const colors = palette();
    const fill = colors[portal.color] || colors[0];
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
    this.spiralEls.push(
      addPortalMouth(svg, portal.x, portal.y, portal.r, fill)
    );
    this.spiralEls.push(
      addPortalMouth(svg, portal.x2, portal.y2, portal.r, fill)
    );
    this.attach(svg as unknown as HTMLElement);
    this.render(0);
  }

  render(_dt: number) {
    const deg = (this.part.angle * 180) / Math.PI;
    for (let i = 0; i < this.spiralEls.length; i++) {
      setAttribute(
        this.spiralEls[i] as unknown as HTMLElement,
        'transform',
        'rotate(' + stringify(deg) + ')'
      );
    }
  }
}
