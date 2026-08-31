import { DIV, POINTER_EVENTS, createElement, px, setStyle } from '../../DomFuncs';
import { accent } from '../../machine/MachineLook';
import type { Collectable } from '../../model/parts/Collectable';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

export class CollectableElement extends PartElement {
  declare part: Collectable;

  constructor(part: Collectable, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const coin = this.part;
    this.setPos(coin.x, coin.y);
    const d = coin.r * 2;
    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      left: px(coin.x - coin.r),
      top: px(coin.y - coin.r),
      width: px(d),
      height: px(d),
      'border-radius': '50%',
      background: accent(),
      [POINTER_EVENTS]: 'none',
    });
    this.attach(el);
    this.render(0);
  }

  render(_dt: number) {
    if (this.el) {
      setStyle(this.el, {
        display: this.part.taken ? 'none' : 'block',
      });
    }
  }
}
