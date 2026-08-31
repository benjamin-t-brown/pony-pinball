import { accent, palette } from '@game/machine/MachineLook';
import { Collectable } from '@game/model/parts/Collectable';
import { Decoration, lightAnimation } from '@game/model/parts/Decoration';
import { Field } from '@game/model/parts/Field';
import { Launcher } from '@game/model/parts/Launcher';
import {
  circleFill,
  obstacleStroke,
  Obstacle,
} from '@game/model/parts/Obstacle';
import { Paddle } from '@game/model/parts/Paddle';
import { Portal } from '@game/model/parts/Portal';
import type { State } from '@game/state/StateFuncs';

type LiveEl = {
  el: Element;
  s: number;
  i: number;
};

export type PlayCache = {
  balls: Element[];
  walls: LiveEl[];
  paddles: LiveEl[];
  launchers: LiveEl[];
  coins: LiveEl[];
  fields: LiveEl[];
  portals: LiveEl[];
  obstacles: LiveEl[];
  lights: LiveEl[];
};

const attr = (el: Element, name: string) => {
  return Number(el.getAttribute(name));
};

const collect = (root: Element, kind: string) => {
  const out: LiveEl[] = [];
  const nodes = root.querySelectorAll('[data-live="' + kind + '"]');
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    out.push({ el, s: attr(el, 'data-s'), i: attr(el, 'data-i') });
  }
  return out;
};

export const collectPlayEls = (root: Element): PlayCache => {
  return {
    balls: Array.from(root.querySelectorAll('[data-live="ball"]')),
    walls: collect(root, 'wall'),
    paddles: collect(root, 'paddle'),
    launchers: collect(root, 'launcher'),
    coins: collect(root, 'coin'),
    fields: collect(root, 'field'),
    portals: collect(root, 'portal'),
    obstacles: collect(root, 'obstacle'),
    lights: collect(root, 'light'),
  };
};

const set = (el: Element, name: string, value: string) => {
  el.setAttribute(name, value);
};

const wallStroke = (rest: number, color: number) => {
  if (rest < 0) {
    return 'rgba(136,136,136,0.2)';
  }
  if (color >= 0) {
    const colors = palette();
    return colors[color % colors.length] || accent();
  }
  return '#888';
};

export const syncPlayVisuals = (cache: PlayCache, sim: State) => {
  for (let i = 0; i < cache.balls.length; i++) {
    const ball = sim.balls[i];
    const el = cache.balls[i];
    if (!ball || !el) {
      continue;
    }
    set(el, 'cx', String(ball.pos.x));
    set(el, 'cy', String(ball.pos.y));
  }

  for (let i = 0; i < cache.walls.length; i++) {
    const item = cache.walls[i];
    const wall = sim.sections[item.s] && sim.sections[item.s].walls[item.i];
    if (!wall) {
      continue;
    }
    set(item.el, 'x1', String(wall.a.x));
    set(item.el, 'y1', String(wall.a.y));
    set(item.el, 'x2', String(wall.b.x));
    set(item.el, 'y2', String(wall.b.y));
    set(item.el, 'stroke', wallStroke(wall.rest, wall.color));
  }

  for (let i = 0; i < cache.paddles.length; i++) {
    const item = cache.paddles[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Paddle)) {
      continue;
    }
    const line = part.getLine();
    set(item.el, 'x1', String(line.a.x));
    set(item.el, 'y1', String(line.a.y));
    set(item.el, 'x2', String(line.b.x));
    set(item.el, 'y2', String(line.b.y));
  }

  for (let i = 0; i < cache.launchers.length; i++) {
    const item = cache.launchers[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Launcher)) {
      continue;
    }
    const launcher = part;
    const t = launcher.getChargeT();
    const len = launcher.len * t;
    set(item.el, 'x2', String(launcher.x - launcher.dir.x * len));
    set(item.el, 'y2', String(launcher.y - launcher.dir.y * len));
    set(item.el, 'stroke', t >= 1 ? '#fc8' : '#fa6');
  }

  for (let i = 0; i < cache.coins.length; i++) {
    const item = cache.coins[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Collectable)) {
      continue;
    }
    (item.el as HTMLElement).style.display = part.taken
      ? 'none'
      : '';
  }

  for (let i = 0; i < cache.fields.length; i++) {
    const item = cache.fields[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Field)) {
      continue;
    }
    const field = part;
    set(
      item.el,
      'fill',
      field.inside ? 'rgba(120,200,255,0.35)' : 'rgba(70,140,220,0.18)'
    );
  }

  for (let i = 0; i < cache.portals.length; i++) {
    const item = cache.portals[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Portal)) {
      continue;
    }
    set(
      item.el,
      'transform',
      'rotate(' + String((part.angle * 180) / Math.PI) + ')'
    );
  }

  for (let i = 0; i < cache.obstacles.length; i++) {
    const item = cache.obstacles[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Obstacle)) {
      continue;
    }
    const obstacle = part;
    set(
      item.el,
      'transform',
      'translate(' +
        obstacle.x +
        ' ' +
        obstacle.y +
        ') rotate(' +
        String((obstacle.angle * 180) / Math.PI) +
        ')'
    );
    const stroke = obstacleStroke(obstacle);
    const kids = item.el.children;
    for (let j = 0; j < kids.length; j++) {
      const kid = kids[j];
      const tag = kid.tagName.toLowerCase();
      if (tag === 'line') {
        set(kid, 'stroke', stroke);
      } else if (tag === 'circle') {
        set(kid, 'fill', circleFill(obstacle.active, obstacle.color));
      }
    }
  }

  for (let i = 0; i < cache.lights.length; i++) {
    const item = cache.lights[i];
    const part = sim.sections[item.s] && sim.sections[item.s].parts[item.i];
    if (!(part instanceof Decoration)) {
      continue;
    }
    const dec = part;
    const on = dec.active;
    const flag = on ? '1' : '0';
    if (item.el.getAttribute('data-on') === flag) {
      continue;
    }
    item.el.setAttribute('data-on', flag);
    item.el.setAttribute('opacity', on ? '1' : '0.2');
    const anim = lightAnimation(dec);
    const kids = item.el.children;
    for (let j = 0; j < kids.length; j++) {
      const g = kids[j] as HTMLElement;
      g.style.animation = anim;
      g.style.animationDelay =
        dec.delay && anim !== 'none' ? j * dec.delay + 'ms' : '0ms';
    }
  }
};
