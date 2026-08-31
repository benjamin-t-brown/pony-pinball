import {
  POINTER_EVENTS,
  SVG,
  createSvgElement,
  px,
  setAttribute,
  setStyle,
  stringify,
} from '../../DomFuncs';
import { accent, palette } from '../../machine/MachineLook';
import type { Launcher } from '../../model/parts/Launcher';
import { PartElement } from '../PartElement';
import type { UiElement } from '../UiElement';

export class LauncherElement extends PartElement {
  declare part: Launcher;

  constructor(part: Launcher, parent?: UiElement) {
    super(part, parent);
  }

  build() {
    const launcher = this.part;
    this.setPos(launcher.x, launcher.y);
    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: px(launcher.x),
      top: px(launcher.y),
      overflow: 'visible',
      [POINTER_EVENTS]: 'none',
    });
    const dir = launcher.dir;
    const drawLen = launcher.len;
    this.addLine(svg, 0, 0, -dir.x * drawLen, -dir.y * drawLen, '#c84', '8');
    this.addLine(svg, 0, 0, 0, 0, accent(), '8');
    this.attach(svg as unknown as HTMLElement);
    this.render(0);
  }

  render(_dt: number) {
    const launcher = this.part;
    const first = this.lineEls[0] as unknown as HTMLElement;
    const fill = this.lineEls[1] as unknown as HTMLElement;
    if (first) {
      setAttribute(first, 'stroke', '#c84');
      setAttribute(first, 'x2', stringify(-launcher.dir.x * launcher.len));
      setAttribute(first, 'y2', stringify(-launcher.dir.y * launcher.len));
    }
    if (fill) {
      const t = launcher.getChargeT();
      const len = launcher.len * t;
      setAttribute(fill, 'x2', stringify(-launcher.dir.x * len));
      setAttribute(fill, 'y2', stringify(-launcher.dir.y * len));
      setAttribute(fill, 'stroke', t >= 1 ? accent() : palette()[1] || accent());
    }
  }
}
