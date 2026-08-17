import {
  LINE,
  SVG,
  appendChild,
  createSvgElement,
  setAttribute,
  setStyle,
} from '../dom';
import { Launcher } from '../model/widgets/Launcher';
import { Paddle } from '../model/widgets/Paddle';
import {
  WIDGET_LAUNCHER,
  WIDGET_PADDLE,
  type Widget,
} from '../model/widgets/Widget';
import { UiElement } from './UiElement';

export class WidgetElement extends UiElement {
  widget: Widget;
  lineEl: SVGLineElement | null = null;

  constructor(widget: Widget, parent?: UiElement) {
    super(parent);
    this.widget = widget;
  }

  build() {
    if (this.widget.type === WIDGET_PADDLE) {
      this.buildPaddle();
    } else if (this.widget.type === WIDGET_LAUNCHER) {
      this.buildLauncher();
    }
  }

  render(_dt: number) {
    if (this.widget.type === WIDGET_PADDLE) {
      this.renderPaddle();
    } else if (this.widget.type === WIDGET_LAUNCHER) {
      this.renderLauncher();
    }
  }

  buildPaddle() {
    const widget = this.widget;
    this.setPos(widget.x, widget.y);

    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: widget.x + 'px',
      top: widget.y + 'px',
      overflow: 'visible',
      'pointer-events': 'none',
    });

    const paddle = widget as Paddle;
    const line = paddle.getLine();
    const lineEl = createSvgElement(LINE, {
      x1: '0',
      y1: '0',
      x2: String(line.b.x - line.a.x),
      y2: String(line.b.y - line.a.y),
      stroke: '#ccc',
      'stroke-width': '6',
      'stroke-linecap': 'round',
    }) as SVGLineElement;
    svg.appendChild(lineEl);

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, svg as unknown as HTMLElement);
    }
    this.el = svg as unknown as HTMLElement;
    this.lineEl = lineEl;
  }

  renderPaddle() {
    if (!this.lineEl) {
      return;
    }
    const paddle = this.widget as Paddle;
    const line = paddle.getLine();
    const el = this.lineEl as unknown as HTMLElement;
    setAttribute(el, 'x2', String(line.b.x - line.a.x));
    setAttribute(el, 'y2', String(line.b.y - line.a.y));
  }

  buildLauncher() {
    const launcher = this.widget as Launcher;
    this.setPos(launcher.x, launcher.y);

    const svg = createSvgElement(SVG, {
      width: '1',
      height: '1',
    }) as SVGSVGElement;
    setStyle(svg as unknown as HTMLElement, {
      position: 'absolute',
      left: launcher.x + 'px',
      top: launcher.y + 'px',
      overflow: 'visible',
      'pointer-events': 'none',
    });

    const len = 24;
    const lineEl = createSvgElement(LINE, {
      x1: '0',
      y1: '0',
      x2: String(-launcher.dir.x * len),
      y2: String(-launcher.dir.y * len),
      stroke: '#c84',
      'stroke-width': '8',
      'stroke-linecap': 'round',
    }) as SVGLineElement;
    svg.appendChild(lineEl);

    const host = this.parent && this.parent.getChildHostEl();
    if (host) {
      appendChild(host, svg as unknown as HTMLElement);
    }
    this.el = svg as unknown as HTMLElement;
    this.lineEl = lineEl;
  }

  renderLauncher() {
    if (!this.lineEl) {
      return;
    }
    const el = this.lineEl as unknown as HTMLElement;
    setAttribute(el, 'stroke', this.widget.active ? '#fc8' : '#c84');
  }
}
