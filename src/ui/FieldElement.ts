import { DIV, appendChild, createElement, setStyle } from '../dom';
import type { Field } from '../model/fields/Field';
import { UiElement } from './UiElement';

export class FieldElement extends UiElement {
  field: Field;

  constructor(field: Field, parent?: UiElement) {
    super(parent);
    this.field = field;
  }

  build() {
    const field = this.field;
    this.setPos(field.x, field.y);
    this.width = field.w;
    this.height = field.h;

    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      left: field.x + 'px',
      top: field.y + 'px',
      width: field.w + 'px',
      height: field.h + 'px',
      'pointer-events': 'none',
    });
    this.paint(el);

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, el);
    }
    this.el = el;
  }

  paint(el: HTMLElement) {
    const field = this.field;
    let bg = 'rgba(70,140,220,0.08)';
    if (field.active) {
      bg = field.inside ? 'rgba(120,200,255,0.35)' : 'rgba(70,160,255,0.18)';
    }
    setStyle(el, { background: bg });
  }

  render(_dt: number) {
    if (this.el) {
      this.paint(this.el);
    }
  }
}
