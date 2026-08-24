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
import { COMPLETE_SECTION } from '../model/constants';
import { findSectionAt } from '../model/Section';
import {
  finishPlay,
  formatTime,
  getState,
  startPlay,
} from '../state/State';
import { UiElement } from '../ui/UiElement';
import { playSound, SOUND_START_GAME } from '../zzfx.js';
import { Layer } from './Layer';

class CompleteHud extends UiElement {
  timeEl: HTMLElement | null = null;
  bestEl: HTMLElement | null = null;
  newEl: HTMLElement | null = null;
  btnEl: HTMLElement | null = null;
  onRestart: () => void;

  constructor(onRestart: () => void) {
    super();
    this.onRestart = onRestart;
  }

  hide() {
    if (this.el) {
      setStyle(this.el, { display: 'none' });
    }
  }

  show() {
    this.readTimes();
    if (this.el) {
      setStyle(this.el, { display: 'block' });
    }
  }

  layout(width: number, height: number) {
    const bw = 180;
    const bh = 44;
    this.width = bw;
    this.height = bh;
    this.x = (width - bw) * 0.5;
    this.y = height * 0.5 + 28;
    if (this.btnEl) {
      setStyle(this.btnEl, {
        left: px(this.x),
        top: px(this.y),
        width: px(bw),
        height: px(bh),
      });
    }
    if (this.timeEl) {
      setStyle(this.timeEl, { top: px(this.y - 88) });
    }
    if (this.bestEl) {
      setStyle(this.bestEl, { top: px(this.y - 64) });
    }
    if (this.newEl) {
      setStyle(this.newEl, { top: px(this.y - 36) });
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
      display: 'none',
    });

    const labelStyle = {
      position: 'absolute',
      left: '0',
      right: '0',
      'text-align': 'center',
      'font-size': '16px',
      [POINTER_EVENTS]: 'none',
    };

    const timeEl = createElement(DIV);
    setStyle(timeEl, { ...labelStyle, color: '#fc8' });
    appendChild(overlay, timeEl);

    const bestEl = createElement(DIV);
    setStyle(bestEl, { ...labelStyle, color: '#8cf' });
    appendChild(overlay, bestEl);

    const newEl = createElement(DIV);
    setStyle(newEl, {
      ...labelStyle,
      color: '#6c6',
      'font-weight': 'bold',
    });
    appendChild(overlay, newEl);

    const btn = createElement('button');
    btn[INNER_HTML] = 'Restart';
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
      this.onRestart();
    });
    appendChild(overlay, btn);

    appendChild(root, overlay);
    this.el = overlay;
    this.timeEl = timeEl;
    this.bestEl = bestEl;
    this.newEl = newEl;
    this.btnEl = btn;
    this.layout(
      root.clientWidth || innerWidth,
      root.clientHeight || innerHeight
    );
  }

  readTimes() {
    const state = getState();
    if (this.timeEl) {
      this.timeEl[INNER_HTML] = 'time: ' + formatTime(state.lastMs);
    }
    if (this.bestEl) {
      this.bestEl[INNER_HTML] =
        'best time: ' +
        (state.prevBestMs > 0 ? formatTime(state.prevBestMs) : '--');
    }
    if (this.newEl) {
      this.newEl[INNER_HTML] = state.newBest ? 'New best time!' : '';
    }
  }
}

export class GameCompleteUiLayer extends Layer {
  hud: CompleteHud;

  constructor(host: HTMLElement) {
    super(host);
    this.hud = new CompleteHud(() => {
      this.onRestart();
    });
    this.addUiElement(this.hud);
    this.onResize(
      host.clientWidth || innerWidth,
      host.clientHeight || innerHeight
    );
  }

  onRestart() {
    startPlay();
    playSound(SOUND_START_GAME);
    this.hud.hide();
  }

  update(dt: number) {
    super.update(dt);
    const state = getState();
    if (!state.playing || state.complete) {
      return;
    }
    const ball = state.balls[0];
    if (!ball) {
      return;
    }
    const section = findSectionAt(
      state.sections,
      ball.pos.x,
      ball.pos.y,
      null
    );
    if (!section || section.id !== COMPLETE_SECTION) {
      return;
    }
    finishPlay();
    this.hud.show();
    this.onResize(
      this.window ? this.window.clientWidth || innerWidth : innerWidth,
      this.window ? this.window.clientHeight || innerHeight : innerHeight
    );
  }
}
