import { DIV, appendChild, createElement, setStyle } from '../dom';
import type { Ball } from '../model/ball';
import { BALL_R } from '../model/constants';

export type BallView = {
  el: HTMLElement;
};

export const createBallView = (parent: HTMLElement): BallView => {
  const el = createElement(DIV);
  setStyle(el, {
    position: 'absolute',
    width: `${BALL_R * 2}px`,
    height: `${BALL_R * 2}px`,
    'border-radius': '50%',
    background:
      'radial-gradient(circle at 35% 30%, #fff6a8, #f0c020 45%, #b8860b)',
    'box-shadow': '0 2px 4px rgba(0,0,0,.4)',
    'pointer-events': 'none',
  });
  appendChild(parent, el);
  return { el };
};

export const drawBall = (view: BallView, ball: Ball) => {
  setStyle(view.el, {
    left: `${ball.pos.x - BALL_R}px`,
    top: `${ball.pos.y - BALL_R}px`,
  });
};
