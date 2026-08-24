import {
  DIV,
  INNER_HTML,
  POINTER_EVENTS,
  appendChild,
  createElement,
  domAddEventListener,
  getGameRoot,
  px,
  setStyle,
} from '../dom';
import { formatTime, getState, startPlay } from '../state/State';
import { UiElement } from '../ui/UiElement';
import { playSound, SOUND_START_GAME } from '../zzfx.js';
import { LAYER_OFF, Layer } from './Layer';

class MenuHud extends UiElement {
  lastEl: HTMLElement | null = null;
  bestEl: HTMLElement | null = null;
  btnEl: HTMLElement | null = null;
  onStart: () => void;

  constructor(onStart: () => void) {
    super();
    this.onStart = onStart;
  }

  hide() {
    if (this.el) {
      setStyle(this.el, { display: 'none' });
    }
  }

  layout(width: number, height: number) {
    const bw = 180;
    const bh = 44;
    this.width = bw;
    this.height = bh;
    this.x = (width - bw) * 0.5;
    this.y = height * 0.5 - 36;
    if (this.btnEl) {
      setStyle(this.btnEl, {
        left: px(this.x),
        top: px(this.y),
        width: px(bw),
        height: px(bh),
      });
    }
    if (this.lastEl) {
      setStyle(this.lastEl, { top: px(this.y + this.height + 16) });
    }
    if (this.bestEl) {
      setStyle(this.bestEl, { top: px(this.y + this.height + 40) });
    }
  }

  checkResizeEvent(width: number, height: number) {
    this.layout(width, height);
    super.checkResizeEvent(width, height);
  }

  build() {
    const root = getGameRoot();
    if (!root) {
      return;
    }
    const overlay = createElement(DIV);
    setStyle(overlay, {
      position: 'absolute',
      inset: '0',
      'z-index': '8',
      background: 'rgba(0,0,0,0.2)',
      [POINTER_EVENTS]: 'none',
    });

    const btn = createElement('button');
    btn[INNER_HTML] = 'Start Game';
    setStyle(btn, {
      position: 'absolute',
      [POINTER_EVENTS]: 'auto',
      cursor: 'pointer',
      color: '#123',
      background: '#fc8',
      border: '0',
      padding: '0',
      'font-size': '18px',
      'font-weight': 'bold',
    });
    domAddEventListener(btn, 'click', () => {
      this.onStart();
    });
    appendChild(overlay, btn);

    const lastEl = createElement(DIV);
    setStyle(lastEl, {
      position: 'absolute',
      left: '0',
      right: '0',
      'text-align': 'center',
      color: '#fc8',
      'font-size': '16px',
      [POINTER_EVENTS]: 'none',
    });
    appendChild(overlay, lastEl);

    const bestEl = createElement(DIV);
    setStyle(bestEl, {
      position: 'absolute',
      left: '0',
      right: '0',
      'text-align': 'center',
      color: '#8cf',
      'font-size': '16px',
      [POINTER_EVENTS]: 'none',
    });
    appendChild(overlay, bestEl);

    appendChild(root, overlay);
    this.el = overlay;
    this.btnEl = btn;
    this.lastEl = lastEl;
    this.bestEl = bestEl;
    this.readTimes();
    this.layout(
      root.clientWidth || innerWidth,
      root.clientHeight || innerHeight
    );
  }

  readTimes() {
    const state = getState();
    if (this.lastEl) {
      this.lastEl[INNER_HTML] = 'last time: ' + formatTime(state.lastMs);
    }
    if (this.bestEl) {
      this.bestEl[INNER_HTML] = 'best time: ' + formatTime(state.bestMs);
    }
  }
}

export class MenuUiLayer extends Layer {
  hud: MenuHud;

  constructor(host: HTMLElement) {
    super(host);
    this.hud = new MenuHud(() => {
      this.onStart();
    });
    this.addUiElement(this.hud);
    this.onResize(
      host.clientWidth || innerWidth,
      host.clientHeight || innerHeight
    );
  }

  onStart() {
    startPlay();
    playSound(SOUND_START_GAME);
    this.hud.hide();
    this.layerState = LAYER_OFF;
  }
}
