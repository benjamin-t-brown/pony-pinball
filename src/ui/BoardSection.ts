import {
  DIV,
  LINE,
  SVG,
  appendChild,
  createElement,
  createSvgElement,
  setStyle,
} from '../dom';
import type { Section } from '../model/Section';
import { UiElement } from './UiElement';
import { WidgetElement } from './WidgetElement';

export class BoardSection extends UiElement {
  section: Section;

  constructor(section: Section, parent?: UiElement) {
    super(parent);
    this.section = section;
    this.setId(section.id);
    this.setPos(section.x, section.y);
    this.width = section.w;
    this.height = section.h;
  }

  build() {
    const section = this.section;
    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      left: section.x + 'px',
      top: section.y + 'px',
      width: section.w + 'px',
      height: section.h + 'px',
      background: section.bg,
    });

    const svg = createSvgElement(SVG, {
      width: String(section.w),
      height: String(section.h),
      viewBox: '0 0 ' + section.w + ' ' + section.h,
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      inset: '0',
    });

    for (const wall of section.walls) {
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
    appendChild(el, svg as unknown as HTMLElement);

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, el);
    }
    this.el = el;

    for (let i = 0; i < section.widgets.length; i++) {
      const child = new WidgetElement(section.widgets[i]);
      this.addChild(child);
      child.build();
    }
  }

  render(dt: number) {
    super.render(dt);
  }
}
