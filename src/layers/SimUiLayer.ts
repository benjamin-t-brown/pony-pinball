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
} from '../DomFuncs';
import { accent, getHud } from '../machine/MachineLook';
import {
  formatPlayValue,
  formatTime,
  getState,
  startPlay,
} from '../state/StateFuncs';
import { Board } from '../ui/Board';
import { hudBtn, hudLabel, hudOverlay } from '../ui/HudStyles';
import { UiElement } from '../ui/UiElement';
import { playSound, SOUND_START_GAME } from '../audio/SoundFuncs';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '../model/Part';
import {
  GOAL_SECTION,
  goalOf,
  goalUsesBalls,
  playLabel,
} from '../machine/MachineGoals';
import { Layer } from './Layer';

const mobileWrap: Record<string, string> = {
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '16px',
  display: 'none',
  'justify-content': 'space-between',
  padding: '0 16px',
  [POINTER_EVENTS]: 'none',
};

const addMobileBtn = (wrap: HTMLElement, label: string, control: number) => {
  const btn = createElement('button');
  btn.className = 'mb';
  btn[INNER_HTML] = label;
  domAddEventListener(btn, 'touchstart', e => {
    e.preventDefault();
    btn.className = 'mb a';
    getState().input[control] = true;
  });
  const up = () => {
    btn.className = 'mb';
    getState().input[control] = false;
  };
  domAddEventListener(btn, 'touchend', up);
  domAddEventListener(btn, 'touchcancel', up);
  appendChild(wrap, btn);
};

class PlayHud extends UiElement {
  timeEl: HTMLElement | null = null;
  btnEl: HTMLElement | null = null;
  mobileEl: HTMLElement | null = null;
  visible = false;
  showMobile = true;

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

  layout(width = 0, height = 0) {
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
    if (this.mobileEl) {
      setStyle(this.mobileEl, {
        display: this.showMobile && height > width ? 'flex' : 'none',
      });
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
    setStyle(overlay, { ...hudOverlay, background: 'none', display: 'none' });

    const timeEl = createElement(DIV);
    setStyle(timeEl, {
      ...hudLabel,
      color: accent(),
      'font-size': '22px',
      'font-weight': 'bold',
    });
    appendChild(overlay, timeEl);

    const btn = createElement('button');
    btn[INNER_HTML] = 'Restart';
    setStyle(btn, hudBtn());
    domAddEventListener(btn, 'click', () => {
      startPlay();
      playSound(SOUND_START_GAME);
    });
    appendChild(overlay, btn);

    const mobile = createElement(DIV);
    setStyle(mobile, mobileWrap);
    const hud = getHud();
    if (hud.flippers) {
      addMobileBtn(mobile, '&lt;', CONTROL_LEFT);
    }
    if (hud.launcher) {
      addMobileBtn(mobile, '^', CONTROL_START);
    }
    if (hud.flippers) {
      addMobileBtn(mobile, '&gt;', CONTROL_RIGHT);
    }
    appendChild(overlay, mobile);

    appendChild(root, overlay);
    this.el = overlay;
    this.timeEl = timeEl;
    this.btnEl = btn;
    this.mobileEl = mobile;
    this.layout();
  }

  render(_dt: number) {
    const state = getState();
    if (state.playing) {
      if (!this.visible) {
        this.show();
      }
      if (this.timeEl) {
        const goal = goalOf(state.machine);
        if (goal.kind === GOAL_SECTION) {
          this.timeEl[INNER_HTML] = formatTime(state.playMs);
        } else {
          let text =
            playLabel(goal) + ': ' + formatPlayValue(state.score, state.machine);
          if (goalUsesBalls(goal)) {
            text += '   ' + state.ballsLeft + ' left';
          }
          this.timeEl[INNER_HTML] = text;
        }
      }
    } else if (this.visible) {
      this.hide();
    }
  }
}

export type SimUiOpts = {
  listenKeys?: boolean;
  showMobile?: boolean;
};

export class SimUiLayer extends Layer {
  constructor(parent: HTMLElement, opts: SimUiOpts = {}) {
    super(parent, opts.listenKeys !== false);
    const hud = new PlayHud();
    hud.showMobile = opts.showMobile !== false;
    this.addUiElement(new Board());
    this.addUiElement(hud);
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
    const hud = getHud();
    if (hud.flippers && (key === 'KeyZ' || key === 'ArrowLeft')) {
      state.input[CONTROL_LEFT] = down;
    } else if (hud.flippers && (key === 'Slash' || key === 'ArrowRight')) {
      state.input[CONTROL_RIGHT] = down;
    } else if (hud.launcher && (key === 'Space' || key === 'Enter')) {
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
