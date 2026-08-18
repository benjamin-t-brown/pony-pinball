import {
  BR,
  DIV,
  INNER_HTML,
  POINTER_EVENTS,
  appendChild,
  createElement,
  getGameRoot,
  setStyle,
  stringify,
} from '../dom';
import { findSectionAt } from '../model/Section';
import { vecLen } from '../sim/physics';
import { getStateGlobal } from '../state/StateManagerInterface';
import { Layer } from './Layer';

const DEBUG_N = 60;

const rollCreate = () => {
  const hist: number[] = [];
  for (let i = 0; i < DEBUG_N; i++) {
    hist.push(0);
  }
  return { hist, i: 0, sum: 0, filled: 0 };
};

const rollPush = (
  roll: { hist: number[]; i: number; sum: number; filled: number },
  value: number
) => {
  roll.sum -= roll.hist[roll.i];
  roll.hist[roll.i] = value;
  roll.sum += value;
  roll.i = (roll.i + 1) % DEBUG_N;
  if (roll.filled < DEBUG_N) {
    roll.filled++;
  }
  return roll.sum / roll.filled;
};

export class DebugLayer extends Layer {
  el: HTMLElement | null = null;
  stepsThisFrame = 0;
  stepRoll = rollCreate();
  fpsRoll = rollCreate();
  fps = 0;
  avgSteps = 0;

  constructor() {
    super(null, 'debug');
    const root = getGameRoot();
    if (!root) {
      return;
    }
    const el = createElement(DIV);
    setStyle(el, {
      position: 'absolute',
      left: '8px',
      top: '8px',
      padding: '6px',
      color: '#0f0',
      background: 'rgba(0,0,0,0.55)',
      'z-index': '9',
      [POINTER_EVENTS]: 'none',
      'white-space': 'pre',
      'font-family': 'monospace',
      'font-size': '12px',
    });
    appendChild(root, el);
    this.el = el;
  }

  update(_dt: number) {
    this.stepsThisFrame++;
  }

  render(dt: number) {
    this.avgSteps = rollPush(this.stepRoll, this.stepsThisFrame);
    this.stepsThisFrame = 0;
    this.fps = rollPush(this.fpsRoll, dt > 0 ? 1000 / dt : 0);

    if (!this.el) {
      return;
    }
    const state = getStateGlobal();
    const ball = state.balls[0];
    let speed = 0;
    let zone = 'none';
    if (ball) {
      speed = vecLen(ball.vel);
      const section = findSectionAt(
        state.sections,
        ball.pos.x,
        ball.pos.y,
        null
      );
      if (section) {
        zone = stringify(section.id);
      }
    }
    this.el[INNER_HTML] =
      'fps ' +
      this.fps.toFixed(0) +
      BR +
      'int ' +
      this.avgSteps.toFixed(2) +
      BR +
      'spd ' +
      speed.toFixed(0) +
      BR +
      'zone ' +
      zone;
  }
}
