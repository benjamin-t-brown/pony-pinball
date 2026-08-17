import {
  BUTTON,
  DIV,
  appendChild,
  createElement,
  domAddEventListener,
  setStyle,
} from '../dom';
import type { GameInput } from '../model/gameState';

export type PaddleControls = {
  el: HTMLElement;
  leftBtn: HTMLElement;
  rightBtn: HTMLElement;
};

export const createPaddleControls = (parent: HTMLElement): PaddleControls => {
  const el = createElement(DIV);
  setStyle(el, {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '8px',
    display: 'flex',
    'justify-content': 'center',
    gap: '24px',
    'z-index': '2',
  });
  appendChild(parent, el);

  const leftBtn = createElement(BUTTON, {
    type: 'button',
    innerHTML: '◀ Left',
  });
  const rightBtn = createElement(BUTTON, {
    type: 'button',
    innerHTML: 'Right ▶',
  });

  for (const btn of [leftBtn, rightBtn]) {
    setStyle(btn, {
      padding: '10px 18px',
      'font-size': '14px',
      'font-weight': '700',
      border: 'none',
      'border-radius': '8px',
      cursor: 'pointer',
      background: '#2a3544',
      color: '#e8eef5',
      'touch-action': 'none',
      'user-select': 'none',
    });
    appendChild(el, btn);
  }

  return { el, leftBtn, rightBtn };
};

const bindHold = (
  btn: HTMLElement,
  keys: string[],
  setPressed: (v: boolean) => void
) => {
  const down = (e: Event) => {
    e.preventDefault();
    setPressed(true);
  };
  const up = () => setPressed(false);

  domAddEventListener(btn, 'pointerdown', down);
  domAddEventListener(btn, 'pointerup', up);
  domAddEventListener(btn, 'pointerleave', up);
  domAddEventListener(btn, 'pointercancel', up);

  addEventListener('keydown', e => {
    if (keys.includes(e.code)) {
      e.preventDefault();
      setPressed(true);
    }
  });
  addEventListener('keyup', e => {
    if (keys.includes(e.code)) {
      setPressed(false);
    }
  });
};

export const bindPaddleControls = (
  controls: PaddleControls,
  input: GameInput
) => {
  bindHold(controls.leftBtn, ['ArrowLeft', 'KeyA', 'KeyZ'], v => {
    input.left = v;
  });
  bindHold(controls.rightBtn, ['ArrowRight', 'KeyD', 'KeyX', 'KeySlash'], v => {
    input.right = v;
  });
};
