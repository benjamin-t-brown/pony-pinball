import { domAddEventListener } from '../dom';
import type { UiElement } from '../ui/UiElement';

export const LAYER_ON = 0;
export const LAYER_OFF = 1;
export const LAYER_SUSPEND = 2;

export abstract class Layer {
  window: HTMLElement | null;
  layerState = LAYER_ON;
  uiElements: UiElement[] = [];
  removeFlag = false;
  id: string;

  constructor(windowOrId: HTMLElement | string | null = null, id = '') {
    if (typeof windowOrId === 'string') {
      this.window = null;
      this.id = windowOrId;
    } else {
      this.window = windowOrId;
      this.id = id;
    }
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
        };
      };
      domAddEventListener(host, 'pointerdown', e => {
        const p = pos(e);
        this.onMouseDown(p.x, p.y, p.b);
      });
      domAddEventListener(host, 'pointerup', e => {
        const p = pos(e);
        this.onMouseUp(p.x, p.y, p.b);
      });
      domAddEventListener(host, 'pointermove', e => {
        const p = pos(e);
        this.onMouseHover(p.x, p.y);
      });
      domAddEventListener(host, 'wheel', e => {
        const p = pos(e);
        this.onMouseWheel(p.x, p.y, p.d);
      });
      addEventListener('keydown', e => {
        this.onKeyDown(e.code, e.keyCode);
      });
      addEventListener('keyup', e => {
        this.onKeyUp(e.code, e.keyCode);
      });
    }
  }

  onMouseDown(x: number, y: number, button: number) {
    if (this.layerState !== LAYER_ON) {
      return;
    }
    for (let i = this.uiElements.length - 1; i >= 0; i--) {
      if (this.uiElements[i].checkMouseDownEvent(x, y, button)) {
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

  onKeyDown(_key: string, _keyCode: number) {}

  onKeyUp(_key: string, _keyCode: number) {}

  turnOn() {
    this.layerState = LAYER_ON;
  }

  turnOff() {
    this.layerState = LAYER_OFF;
  }

  suspend() {
    this.layerState = LAYER_SUSPEND;
  }

  remove() {
    this.removeFlag = true;
  }

  shouldRemove() {
    return this.removeFlag;
  }

  getId() {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  addUiElement(element: UiElement) {
    this.uiElements.push(element);
    element.build();
  }

  getUiElement(elementId: string): UiElement | null {
    for (const elem of this.uiElements) {
      if (elem.getId() === elementId) {
        return elem;
      }
    }
    return null;
  }

  getWindow() {
    return this.window;
  }

  input() {}

  update(dt: number) {
    for (const elem of this.uiElements) {
      elem.update(dt);
    }
  }

  render(dt: number) {
    for (const elem of this.uiElements) {
      elem.render(dt);
    }
  }
}
