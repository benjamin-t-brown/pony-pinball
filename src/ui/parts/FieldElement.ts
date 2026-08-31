import {
  DIV,
  POINTER_EVENTS,
  createElement,
  px,
  setStyle,
  stringify,
} from '../../DomFuncs';
import { TEX_ARROWS, getTextureClass } from '../../model/parts/Decoration';
import type { Field } from '../../model/parts/Field';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

export class FieldElement extends PartElement {
  declare part: Field;

  constructor(part: Field, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const field = this.part;
    this.setPos(field.x, field.y);
    if (field.trigger) {
      return;
    }
    this.width = field.w;
    this.height = field.h;
    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      left: px(field.x),
      top: px(field.y),
      width: px(field.w),
      height: px(field.h),
      [POINTER_EVENTS]: 'none',
    });
    const forceLen = Math.hypot(field.ax, field.ay);
    if (field.grav === 0 && forceLen > 0) {
      el.className = getTextureClass(TEX_ARROWS);
      setStyle(el, {
        '--r':
          stringify((Math.atan2(field.ay, field.ax) * 180) / Math.PI) + 'deg',
      });
    }
    this.attach(el);
    this.render(0);
  }

  render(_dt: number) {}
}
