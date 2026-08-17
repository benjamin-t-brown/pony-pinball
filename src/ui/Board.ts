import {
  DIV,
  TRANSFORM,
  appendChild,
  createElement,
  getGameRoot,
  removeChild,
  setStyle,
} from '../dom';
import { getStateGlobal } from '../state/StateManagerInterface';
import type { Ball } from '../model/Ball';
import type { Section } from '../model/Section';
import { findSectionAt } from '../model/Section';
import { BallElement } from './BallElement';
import { BoardSection } from './BoardSection';
import {
  CAM_SCALE_STEP,
  clampCamScale,
  getCamPan,
  lerpCam,
} from './camera';
import { UiElement } from './UiElement';

export class Board extends UiElement {
  worldEl: HTMLElement | null = null;
  balls: BallElement[] = [];
  section: Section | null = null;
  camX = 0;
  camY = 0;
  camScale = 1;
  targetX = 0;
  targetY = 0;

  constructor() {
    super();
    this.setId('board');
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
    const state = getStateGlobal();
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

  setPanTarget(section: Section, snap: boolean) {
    const pan = getCamPan(section, this.width, this.height, this.camScale);
    this.targetX = pan.x;
    this.targetY = pan.y;
    if (snap) {
      this.camX = pan.x;
      this.camY = pan.y;
    }
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
    const state = getStateGlobal();
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
      background: '#222',
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
    this.section = state.sections[0];
    if (this.section) {
      this.setPanTarget(this.section, true);
    }
    this.applyCamera();
  }

  checkResizeEvent(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this.section) {
      this.setPanTarget(this.section, true);
      this.applyCamera();
    }
    super.checkResizeEvent(width, height);
  }

  onMouseWheel(_x: number, _y: number, delta: number) {
    if (delta > 0) {
      this.camScale = clampCamScale(this.camScale / CAM_SCALE_STEP);
    } else {
      this.camScale = clampCamScale(this.camScale * CAM_SCALE_STEP);
    }
    if (this.section) {
      this.setPanTarget(this.section, true);
    }
    this.applyCamera();
  }

  onMouseDown(x: number, y: number, _button: number, shift = false) {
    if (!shift) {
      return;
    }
    const wx = this.camX + x / this.camScale;
    const wy = this.camY + y / this.camScale;
    const state = getStateGlobal();
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
    const state = getStateGlobal();
    const ball = state.balls[0];
    if (ball) {
      const next = findSectionAt(
        state.sections,
        ball.pos.x,
        ball.pos.y,
        this.section
      );
      if (next && next !== this.section) {
        this.section = next;
        this.setPanTarget(next, false);
      }
    }
    this.camX = lerpCam(this.camX, this.targetX, dt);
    this.camY = lerpCam(this.camY, this.targetY, dt);
    this.applyCamera();
    super.update(dt);
  }

  render(dt: number) {
    super.render(dt);
  }
}
