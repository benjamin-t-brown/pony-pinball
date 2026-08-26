import {
  DIV,
  LINE,
  SVG,
  appendChild,
  createElement,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../dom';
import type { Section } from '../model/Section';
import { GATE_COLORS } from '../model/builders';
import { ACCENT } from '../model/constants';
import { PartElement } from './PartElement';
import { UiElement } from './UiElement';

export class BoardSection extends UiElement {
  section: Section;
  wallEls: SVGLineElement[] = [];

  constructor(section: Section, parent?: UiElement) {
    super(parent);
    this.section = section;
    this.setPos(section.x, section.y);
    this.width = section.w;
    this.height = section.h;
  }

  build() {
    const section = this.section;
    const el = createElement(DIV);
    el.className = 'sb';
    setStyle(el, {
      position: 'absolute',
      left: px(section.x),
      top: px(section.y),
      width: px(section.w),
      height: px(section.h),
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

    for (let i = 0; i < section.fills.length; i++) {
      const f = section.fills[i];
      svg.appendChild(
        createSvgElement('path', {
          'd':
            'M' +
            stringify(f[0]) +
            ' ' +
            stringify(f[1]) +
            'L' +
            stringify(f[2]) +
            ' ' +
            stringify(f[3]) +
            'L' +
            stringify(f[4]) +
            ' ' +
            stringify(f[5]) +
            'Z',
          fill: GATE_COLORS[(f[6] | 0) % GATE_COLORS.length],
        })
      );
    }

    for (const wall of section.walls) {
      const gate = wall.color >= 0;
      const stroke = gate
        ? GATE_COLORS[wall.color % GATE_COLORS.length] || ACCENT
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
      const line = createSvgElement(LINE, attrs) as SVGLineElement;
      svg.appendChild(line);
      this.wallEls.push(line);
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
    const walls = this.section.walls;
    for (let i = 0; i < this.wallEls.length; i++) {
      const wall = walls[i];
      const gate = wall.color >= 0;
      const stroke =
        wall.rest < 0
          ? 'rgba(136,136,136,0.2)'
          : gate
            ? GATE_COLORS[wall.color % GATE_COLORS.length] || ACCENT
            : '#888';
      setAttribute(this.wallEls[i] as unknown as HTMLElement, 'stroke', stroke);
    }
    super.render(dt);
  }
}
