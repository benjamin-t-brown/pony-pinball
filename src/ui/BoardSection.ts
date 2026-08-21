import {
  DIV,
  LINE,
  SVG,
  appendChild,
  createElement,
  createSvgElement,
  px,
  setStyle,
  stringify,
} from '../dom';
import type { Section } from '../model/Section';
import { GATE_COLORS } from '../model/builders';
import { PartElement } from './PartElement';
import { UiElement } from './UiElement';

export class BoardSection extends UiElement {
  section: Section;

  constructor(section: Section, parent?: UiElement) {
    super(parent);
    this.section = section;
    this.setId(stringify(section.id));
    this.setPos(section.x, section.y);
    this.width = section.w;
    this.height = section.h;
  }

  build() {
    const section = this.section;
    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      left: px(section.x),
      top: px(section.y),
      width: px(section.w),
      height: px(section.h),
      background: section.bg,
    });

    const svg = createSvgElement(SVG, {
      width: stringify(section.w),
      height: stringify(section.h),
      viewBox: '0 0 ' + section.w + ' ' + section.h,
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      inset: '0',
    });

    for (const wall of section.walls) {
      const gate = wall.color >= 0;
      const stroke = gate
        ? GATE_COLORS[wall.color % GATE_COLORS.length] || '#fc8'
        : '#888';
      const attrs: Record<string, string> = {
        x1: stringify(wall.a.x),
        y1: stringify(wall.a.y),
        x2: stringify(wall.b.x),
        y2: stringify(wall.b.y),
        stroke,
        'stroke-width': gate ? '6' : '4',
        'stroke-linecap': 'round',
      };
      if (gate) {
        attrs['stroke-dasharray'] = '10 6';
      }
      svg.appendChild(createSvgElement(LINE, attrs));
    }
    appendChild(el, svg as unknown as HTMLElement);

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, el);
    }
    this.el = el;

    for (let i = 0; i < section.parts.length; i++) {
      const child = new PartElement(section.parts[i]);
      this.addChild(child);
      child.build();
    }
  }

  render(dt: number) {
    super.render(dt);
  }
}
