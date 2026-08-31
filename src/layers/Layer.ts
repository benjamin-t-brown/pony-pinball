import { domAddEventListener } from '../DomFuncs';
import type { UiElement } from '../ui/UiElement';

export const LAYER_ON = 0;
export const LAYER_OFF = 1;

export abstract class Layer {
  window: HTMLElement | null;
  layerState = LAYER_ON;
  uiElements: UiElement[] = [];

  constructor(window: HTMLElement | null = null, listenKeys = true) {
    this.window = window;
    if (this.window) {
      const host = this.window;
      const pos = (e: Event) => {
        const r = host.getBoundingClientRect();
        const p = e as PointerEvent & WheelEvent;
        return {
          x: p.clientX - r.left,
          y: p.clientY - r.top,
          b: p.button || 0,
          d: p.deltaY || 0,
          s: p.shiftKey,
        };
      };
      domAddEventListener(host, 'pointerdown', e => {
        const p = pos(e);
        this.onMouseDown(p.x, p.y, p.b, p.s);
      });
      domAddEventListener(host, 'pointerup', e => {
        const p = pos(e);
        this.onMouseUp(p.x, p.y, p.b);
      });
      domAddEventListener(host, 'pointermove', e => {
        const p = pos(e);
        this.onMouseHover(p.x, p.y);
      });
      if (listenKeys) {
        addEventListener('keydown', e => {
          this.onKeyDown(e.code, e.keyCode);
        });
        addEventListener('keyup', e => {
          this.onKeyUp(e.code, e.keyCode);
        });
      }
      addEventListener('resize', () => {
        this.onResize(
          host.clientWidth || innerWidth,
          host.clientHeight || innerHeight
        );
      });
      host.addEventListener(
        'wheel',
        e => {
          e.preventDefault();
          const p = pos(e);
          this.onMouseWheel(p.x, p.y, p.d);
        },
        { passive: false }
      );
    }
  }

  onMouseDown(x: number, y: number, button: number, shift = false) {
    if (this.layerState !== LAYER_ON) {
      return;
    }
    for (let i = this.uiElements.length - 1; i >= 0; i--) {
      if (this.uiElements[i].checkMouseDownEvent(x, y, button, shift)) {
        return;
      }
    }
  }

  onMouseUp(x: number, y: number, button: number) {
    if (this.layerState !== LAYER_ON) {
      return;
    }
    for (let i = this.uiElements.length - 1; i >= 0; i--) {
      if (this.uiElements[i].checkMouseUpEvent(x, y, button)) {
        return;
      }
    }
  }

  onMouseHover(x: number, y: number) {
    if (this.layerState !== LAYER_ON) {
      return;
    }
    for (let i = this.uiElements.length - 1; i >= 0; i--) {
      if (this.uiElements[i].checkHoverEvent(x, y)) {
        return;
      }
    }
  }

  onMouseWheel(x: number, y: number, dir: number) {
    if (this.layerState !== LAYER_ON) {
      return;
    }
    for (let i = this.uiElements.length - 1; i >= 0; i--) {
      if (this.uiElements[i].checkMouseWheelEvent(x, y, dir)) {
        return;
      }
    }
  }

  onResize(width: number, height: number) {
    if (this.layerState === LAYER_OFF) {
      return;
    }
    for (const elem of this.uiElements) {
      elem.checkResizeEvent(width, height);
    }
  }

  onKeyDown(_key: string, _keyCode: number) {}

  onKeyUp(_key: string, _keyCode: number) {}

  addUiElement(element: UiElement) {
    this.uiElements.push(element);
    element.build();
  }

  /** Sim tick. Do not write CSS here. */
  update(dt: number) {
    for (const elem of this.uiElements) {
      elem.update(dt);
    }
  }

  /** Paint from model state. Once per frame. */
  render(dt: number) {
    for (const elem of this.uiElements) {
      elem.render(dt);
    }
  }
}
