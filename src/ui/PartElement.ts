import {
  LINE,
  appendChild,
  createSvgElement,
  setStyle,
  stringify,
} from '../DomFuncs';
import type { Part } from '../model/Part';
import { UiElement } from './UiElement';

/** Shared host for per-kind views under `src/ui/parts/`. */
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
    this.syncOpacity();
  }

  syncOpacity() {
    if (this.el) {
      setStyle(this.el, { opacity: stringify(this.part.opacity) });
    }
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

  build() {}
}
