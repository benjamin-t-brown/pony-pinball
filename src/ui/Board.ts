import {
  DIV,
  TRANSFORM,
  appendChild,
  createElement,
  getGameRoot,
  removeChild,
  setStyle,
} from '../dom';
import { getState } from '../state/State';
import type { Ball } from '../model/Ball';
import { COMPLETE_SECTION } from '../model/constants';
import type { Section } from '../model/Section';
import { findSectionAt } from '../model/Section';
import { BallElement } from './BallElement';
import { BoardSection } from './BoardSection';
import {
  CAM_SCALE_STEP,
  clampCamScale,
  getCamFitScale,
  getCamLook,
  getCamPan,
  getMenuTourCam,
  lerpCam,
} from '../model/camera';
import { UiElement } from './UiElement';

export class Board extends UiElement {
  worldEl: HTMLElement | null = null;
  balls: BallElement[] = [];
  section: Section | null = null;
  camX = 0;
  camY = 0;
  camScale = 1;
  lookX = 0;
  lookY = 0;
  targetLookX = 0;
  targetLookY = 0;
  targetScale = 1;
  wasPlaying = false;
  menuTourMs = 0;

  constructor() {
    super();
    this.shouldPropagateEventsToChildren = false;
  }

  getChildHostEl(): HTMLElement | null {
    return this.worldEl;
  }

  addBall(ball: Ball) {
    const el = new BallElement(ball);
    this.addChild(el);
    if (this.worldEl) {
      el.build();
    }
    return el;
  }

  getBallElements() {
    return this.balls;
  }

  removeBall(ball: BallElement) {
    const i = this.balls.indexOf(ball);
    if (i < 0) {
      return;
    }
    this.removeChildAtIndex(this.children.indexOf(ball));
  }

  syncBalls() {
    const state = getState();
    for (const ball of state.balls) {
      if (
        !this.balls.some(el => {
          return el.ball === ball;
        })
      ) {
        this.addBall(ball);
      }
    }
    for (const el of this.balls.slice()) {
      if (state.balls.indexOf(el.ball) < 0) {
        this.removeBall(el);
      }
    }
  }

  addChild(child: UiElement) {
    super.addChild(child);
    if (child instanceof BallElement && this.balls.indexOf(child) < 0) {
      this.balls.push(child);
    }
  }

  removeChildAtIndex(index: number) {
    const child = this.children[index];
    if (child instanceof BallElement) {
      const i = this.balls.indexOf(child);
      if (i >= 0) {
        this.balls.splice(i, 1);
      }
    }
    const host = this.getChildHostEl();
    if (child && child.el && host) {
      removeChild(host, child.el);
    }
    super.removeChildAtIndex(index);
  }

  readViewSize() {
    const root = getGameRoot();
    const w = (root && root.clientWidth) || innerWidth;
    const h = (root && root.clientHeight) || innerHeight;
    this.width = w;
    this.height = h;
  }

  applyLook() {
    const pan = getCamPan(
      this.lookX,
      this.lookY,
      this.width,
      this.height,
      this.camScale
    );
    this.camX = pan.x;
    this.camY = pan.y;
  }

  applyMenuTour(dt: number) {
    this.menuTourMs += dt;
    const look = getMenuTourCam(
      this.menuTourMs,
      getState().sections,
      this.width,
      this.height
    );
    this.section = look.section;
    this.lookX = look.x;
    this.lookY = look.y;
    this.camScale = look.scale;
    this.targetLookX = look.x;
    this.targetLookY = look.y;
    this.targetScale = look.scale;
    this.applyLook();
  }

  setCamTarget(section: Section, snap: boolean) {
    const look = getCamLook(section);
    this.targetLookX = look.x;
    this.targetLookY = look.y;
    this.targetScale = getCamFitScale(section, this.width, this.height);
    if (snap) {
      this.lookX = look.x;
      this.lookY = look.y;
      this.camScale = this.targetScale;
    }
    this.applyLook();
  }

  applyCamera() {
    if (!this.worldEl) {
      return;
    }
    setStyle(this.worldEl, {
      'transform-origin': '0 0',
      [TRANSFORM]:
        'scale(' +
        this.camScale +
        ') translate(' +
        -this.camX +
        'px,' +
        -this.camY +
        'px)',
    });
  }

  build() {
    const state = getState();
    const root = getGameRoot();
    if (!root) {
      return;
    }
    this.readViewSize();

    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      inset: '0',
      overflow: 'hidden',
    });
    appendChild(root, el);

    const worldEl = createElement(DIV);
    setStyle(worldEl, {
      position: 'absolute',
      left: '0px',
      top: '0px',
    });
    appendChild(el, worldEl);

    this.el = el;
    this.worldEl = worldEl;

    for (const section of state.sections) {
      const room = new BoardSection(section);
      this.addChild(room);
      room.build();
    }

    this.syncBalls();
    if (!state.playing && !state.complete) {
      this.applyMenuTour(0);
    } else {
      const ball = state.balls[0];
      this.section = ball
        ? findSectionAt(state.sections, ball.pos.x, ball.pos.y, null)
        : state.sections[0];
      if (this.section) {
        this.setCamTarget(this.section, true);
      }
    }
    this.applyCamera();
  }

  checkResizeEvent(width: number, height: number) {
    this.width = width;
    this.height = height;
    const state = getState();
    if (!state.playing && !state.complete) {
      this.applyMenuTour(0);
      this.applyCamera();
    } else if (this.section) {
      this.setCamTarget(this.section, true);
      this.applyCamera();
    }
    super.checkResizeEvent(width, height);
  }

  onMouseWheel(_x: number, _y: number, delta: number) {
    if (!getState().playing) {
      return;
    }
    if (delta > 0) {
      this.camScale = clampCamScale(this.camScale / CAM_SCALE_STEP);
    } else {
      this.camScale = clampCamScale(this.camScale * CAM_SCALE_STEP);
    }
    this.targetScale = this.camScale;
    this.applyLook();
    this.applyCamera();
  }

  onMouseDown(x: number, y: number, _button: number, shift = false) {
    if (!shift || !getState().playing) {
      return;
    }
    const wx = this.camX + x / this.camScale;
    const wy = this.camY + y / this.camScale;
    const state = getState();
    const section = findSectionAt(state.sections, wx, wy, null);
    if (!section) {
      return;
    }
    const ball = state.balls[0];
    if (!ball) {
      return;
    }
    ball.pos.x = wx;
    ball.pos.y = wy;
    ball.vel.x = 0;
    ball.vel.y = 0;
  }

  update(dt: number) {
    this.syncBalls();
    const state = getState();
    const ball = state.balls[0];
    if (!state.playing && !state.complete) {
      this.applyMenuTour(dt);
    } else if (!state.playing) {
      const room = state.sections[COMPLETE_SECTION];
      if (room && this.section !== room) {
        this.section = room;
        this.setCamTarget(room, true);
      }
    } else if (ball) {
      const next = findSectionAt(
        state.sections,
        ball.pos.x,
        ball.pos.y,
        this.section
      );
      if (
        next &&
        (next !== this.section || state.playing !== this.wasPlaying)
      ) {
        this.section = next;
        this.setCamTarget(next, false);
      }
    }
    this.wasPlaying = state.playing;
    this.lookX = lerpCam(this.lookX, this.targetLookX, dt);
    this.lookY = lerpCam(this.lookY, this.targetLookY, dt);
    this.camScale = lerpCam(this.camScale, this.targetScale, dt);
    this.applyLook();
    this.applyCamera();
    super.update(dt);
  }

  render(dt: number) {
    super.render(dt);
  }
}
