import {
  DIV,
  INNER_HTML,
  appendChild,
  createElement,
  domAddEventListener,
  getGameRoot,
  px,
  setStyle,
} from '../DomFuncs';
import { accent, palette } from '../machine/MachineLook';
import { findSectionAt } from '../model/SectionFuncs';
import {
  finishPlay,
  formatPlayValue,
  getState,
  startPlay,
} from '../state/StateFuncs';
import { UiElement } from '../ui/UiElement';
import { hudBtn, hudLabel, hudOverlay } from '../ui/HudStyles';
import { playSound, SOUND_START_GAME } from '../audio/SoundFuncs';
import { completeSectionOf, goalOf, playLabel } from '../machine/MachineGoals';
import { Layer } from './Layer';

class CompleteHud extends UiElement {
  timeEl: HTMLElement | null = null;
  bestEl: HTMLElement | null = null;
  newEl: HTMLElement | null = null;
  btnEl: HTMLElement | null = null;
  onRestart: () => void;
  visible = false;

  constructor(onRestart: () => void) {
    super();
    this.onRestart = onRestart;
  }

  hide() {
    this.visible = false;
    if (this.el) {
      setStyle(this.el, { display: 'none' });
    }
  }

  show() {
    this.readTimes();
    this.visible = true;
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
    setStyle(overlay, { ...hudOverlay, display: 'none' });

    const timeEl = createElement(DIV);
    setStyle(timeEl, { ...hudLabel, color: accent() });
    appendChild(overlay, timeEl);

    const bestEl = createElement(DIV);
    setStyle(bestEl, { ...hudLabel, color: palette()[4] || accent() });
    appendChild(overlay, bestEl);

    const newEl = createElement(DIV);
    setStyle(newEl, {
      ...hudLabel,
      color: palette()[3] || accent(),
      'font-weight': 'bold',
    });
    appendChild(overlay, newEl);

    const btn = createElement('button');
    btn[INNER_HTML] = 'Restart';
    setStyle(btn, hudBtn());
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
    const label = playLabel(goalOf(state.machine));
    if (this.timeEl) {
      this.timeEl[INNER_HTML] =
        label + ': ' + formatPlayValue(state.lastMs, state.machine);
    }
    if (this.bestEl) {
      this.bestEl[INNER_HTML] =
        'best ' +
        label +
        ': ' +
        (state.prevBestMs > 0
          ? formatPlayValue(state.prevBestMs, state.machine)
          : '--');
    }
    if (this.newEl) {
      this.newEl[INNER_HTML] = state.newBest ? 'New best ' + label + '!' : '';
    }
  }
}

export class GameCompleteUiLayer extends Layer {
  hud: CompleteHud;
  onComplete: (() => void) | null;

  constructor(
    host: HTMLElement,
    opts: { listenKeys?: boolean; onComplete?: () => void } = {}
  ) {
    super(host, opts.listenKeys !== false);
    this.onComplete = opts.onComplete || null;
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
    if (state.complete) {
      if (!this.hud.visible) {
        this.hud.show();
        if (this.onComplete) {
          this.onComplete();
        }
        this.onResize(
          this.window ? this.window.clientWidth || innerWidth : innerWidth,
          this.window ? this.window.clientHeight || innerHeight : innerHeight
        );
      }
      return;
    }
    if (!state.playing) {
      return;
    }
    const winSection = completeSectionOf(state.machine);
    if (winSection < 0) {
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
    if (!section || section.id !== winSection) {
      return;
    }
    finishPlay();
    this.hud.show();
    if (this.onComplete) {
      this.onComplete();
    }
    this.onResize(
      this.window ? this.window.clientWidth || innerWidth : innerWidth,
      this.window ? this.window.clientHeight || innerHeight : innerHeight
    );
  }
}
