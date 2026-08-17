import {
  LINE,
  SVG,
  appendChild,
  createSvgElement,
  setStyle,
} from '../dom';
import type { Line as SimLine } from '../sim/physics';
import { H, W } from '../model/constants';

export type Playfield = {
  root: HTMLElement;
  svg: SVGSVGElement;
};

export const createPlayfield = (root: HTMLElement, walls: SimLine[]): Playfield => {
  setStyle(document.body, {
    margin: '0',
    background: '#1a1a22',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'min-height': '100vh',
    'font-family': 'system-ui, sans-serif',
  });

  setStyle(root, {
    width: `${W}px`,
    height: `${H}px`,
    position: 'relative',
    overflow: 'hidden',
    background: '#0d1520',
    'box-shadow': '0 0 0 3px #3a4a5c, 0 12px 40px rgba(0,0,0,.5)',
  });

  const svg = createSvgElement(SVG, {
    width: String(W),
    height: String(H),
    viewBox: `0 0 ${W} ${H}`,
  }) as SVGSVGElement;

  setStyle(svg as unknown as HTMLElement, {
    position: 'absolute',
    inset: '0',
    'pointer-events': 'none',
  });
  appendChild(root, svg as unknown as HTMLElement);

  for (const wall of walls) {
    svg.appendChild(
      createSvgElement(LINE, {
        x1: String(wall.a.x),
        y1: String(wall.a.y),
        x2: String(wall.b.x),
        y2: String(wall.b.y),
        stroke: '#7a8fa6',
        'stroke-width': '4',
        'stroke-linecap': 'round',
      })
    );
  }

  return { root, svg };
};
