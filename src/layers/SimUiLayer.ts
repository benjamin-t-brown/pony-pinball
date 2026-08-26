import {
  DIV,
  INNER_HTML,
  appendChild,
  createElement,
  domAddEventListener,
  getGameRoot,
  px,
  setStyle,
} from '../dom';
import { ACCENT } from '../model/constants';
import { formatTime, getState, startPlay } from '../state/State';
import { Board } from '../ui/Board';
import { hudBtn, hudLabel, hudOverlay } from '../ui/hud';
import { UiElement } from '../ui/UiElement';
import { playSound, SOUND_START_GAME } from '../zzfx.js';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '../model/Part';
import { Layer } from './Layer';

class PlayHud extends UiElement {
  timeEl: HTMLElement | null = null;
  btnEl: HTMLElement | null = null;
  visible = false;

  hide() {
    this.visible = false;
    if (this.el) {
      setStyle(this.el, { display: 'none' });
    }
  }

  show() {
    this.visible = true;
    if (this.el) {
      setStyle(this.el, { display: 'block' });
    }
  }

  layout() {
    const bw = 120;
    const bh = 36;
    this.width = bw;
    this.height = bh;
    this.x = 12;
    this.y = 12;
    if (this.btnEl) {
      setStyle(this.btnEl, {
        left: px(this.x),
        top: px(this.y),
        width: px(bw),
        height: px(bh),
      });
    }
    if (this.timeEl) {
      setStyle(this.timeEl, { top: px(12) });
    }
  }

  checkResizeEvent(width: number, height: number) {
    this.layout();
    super.checkResizeEvent(width, height);
  }

  build() {
    const root = getGameRoot();
    if (!root) {
      return;
    }
    const overlay = createElement(DIV);
    setStyle(overlay, { ...hudOverlay, background: 'none', display: 'none' });

    const timeEl = createElement(DIV);
    setStyle(timeEl, {
      ...hudLabel,
      color: ACCENT,
      'font-size': '22px',
      'font-weight': 'bold',
    });
    appendChild(overlay, timeEl);

    const btn = createElement('button');
    btn[INNER_HTML] = 'Restart';
    setStyle(btn, hudBtn);
    domAddEventListener(btn, 'click', () => {
      startPlay();
      playSound(SOUND_START_GAME);
    });
    appendChild(overlay, btn);

    appendChild(root, overlay);
    this.el = overlay;
    this.timeEl = timeEl;
    this.btnEl = btn;
    this.layout();
  }

  render(_dt: number) {
    const state = getState();
    if (state.playing) {
      if (!this.visible) {
        this.show();
      }
      if (this.timeEl) {
        this.timeEl[INNER_HTML] = formatTime(state.playMs);
      }
    } else if (this.visible) {
      this.hide();
    }
  }
}

export class SimUiLayer extends Layer {
  constructor(parent: HTMLElement) {
    super(parent);
    this.addUiElement(new Board());
    this.addUiElement(new PlayHud());
    this.onResize(
      parent.clientWidth || innerWidth,
      parent.clientHeight || innerHeight
    );
  }

  setControl(key: string, down: boolean) {
    const state = getState();
    if (!state.playing) {
      return;
    }
    if (key === 'KeyZ' || key === 'ArrowLeft') {
      state.input[CONTROL_LEFT] = down;
    } else if (key === 'Slash' || key === 'ArrowRight') {
      state.input[CONTROL_RIGHT] = down;
    } else if (key === 'Space' || key === 'Enter') {
      state.input[CONTROL_START] = down;
    }
  }

  onKeyDown(key: string, _keyCode: number) {
    this.setControl(key, true);
  }

  onKeyUp(key: string, _keyCode: number) {
    this.setControl(key, false);
  }
}
