let DIV = 'div';
let BUTTON = 'button';
let P = 'p';
let SPAN = 'span';
let SVG = 'svg';
let LINE = 'line';
let CIRCLE = 'circle';
let BR = '<br>';
let TRANSITION = 'transition';
let TRANSFORM = 'transform';
let INNER_HTML = 'innerHTML';
let EVENT_CLICK = 'click';
let EVENT_MOUSE_OVER = 'mouseover';
let EVENT_DRAG_START = 'dragstart';
let EVENT_DRAG_END = 'dragend';
let EVENT_DRAG_OVER = 'dragover';
let EVENT_DRAG_LEAVE = 'dragleave';
let EVENT_DROP = 'drop';
let DRAGGABLE = 'draggable';
let SVG_NS = 'http://www.w3.org/2000/svg';
let POINTER_EVENTS = 'pointer-events';
let getDocumentBody = () => {
    return document.body;
};
let getGameRoot = () => {
    return getElementById('game');
};
let setStyle = (element, styles) => {
    for (let k in styles) {
        element.style.setProperty(k, styles[k]);
    }
};
let createElement = (tag, attributes = {}, children = []) => {
    let element = document.createElement(tag);
    for (let k in attributes) {
        if (k === INNER_HTML) {
            element.innerHTML = attributes[k];
        }
        else {
            element.setAttribute(k, attributes[k]);
        }
    }
    for (let child of children) {
        element.appendChild(child);
    }
    return element;
};
let createSvgElement = (tag, attributes = {}, children = []) => {
    let element = document.createElementNS(SVG_NS, tag);
    for (let k in attributes) {
        element.setAttribute(k, attributes[k]);
    }
    for (let child of children) {
        element.appendChild(child);
    }
    return element;
};
let appendChild = (parent, child) => {
    parent.appendChild(child);
};
let prependChild = (parent, child) => {
    parent.prepend(child);
};
let removeChild = (parent, child) => {
    parent.removeChild(child);
};
let clearChildren = (parent) => {
    parent[INNER_HTML] = '';
};
let getElementById = (id) => {
    return document.getElementById(id);
};
let getElementsByClassName = (className) => {
    return document.getElementsByClassName(className);
};
let domAddEventListener = (element, event, listener) => {
    element.addEventListener(event, listener);
};
let domRemoveEventListener = (element, event, listener) => {
    element.removeEventListener(event, listener);
};
let setAttribute = (element, attribute, value) => {
    element.setAttribute(attribute, value);
};
let removeAttribute = (element, attribute) => {
    element.removeAttribute(attribute);
};
let hasAttribute = (element, attribute) => {
    return element.hasAttribute(attribute);
};
let preventDefault = (event) => {
    event.preventDefault();
};
let nextTick = (callback) => {
    timeoutPromise(1).then(callback);
};
let timeoutPromise = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
function copyObject(obj) {
    return structuredClone(obj);
}
let px = (n) => {
    return n + 'px';
};
let stringify = (n) => {
    return n + '';
};
let LAYER_ON = 0;
let LAYER_OFF = 1;
let LAYER_SUSPEND = 2;
class Layer {
    window;
    layerState = LAYER_ON;
    uiElements = [];
    removeFlag = false;
    id;
    constructor(windowOrId = null, id = '') {
        if (typeof windowOrId === 'string') {
            this.window = null;
            this.id = windowOrId;
        }
        else {
            this.window = windowOrId;
            this.id = id;
        }
        if (this.window) {
            let host = this.window;
            let pos = (e) => {
                let r = host.getBoundingClientRect();
                let p = e;
                return {
                    x: p.clientX - r.left,
                    y: p.clientY - r.top,
                    b: p.button || 0,
                    d: p.deltaY || 0,
                    s: p.shiftKey,
                };
            };
            domAddEventListener(host, 'pointerdown', e => {
                let p = pos(e);
                this.onMouseDown(p.x, p.y, p.b, p.s);
            });
            domAddEventListener(host, 'pointerup', e => {
                let p = pos(e);
                this.onMouseUp(p.x, p.y, p.b);
            });
            domAddEventListener(host, 'pointermove', e => {
                let p = pos(e);
                this.onMouseHover(p.x, p.y);
            });
            addEventListener('keydown', e => {
                this.onKeyDown(e.code, e.keyCode);
            });
            addEventListener('keyup', e => {
                this.onKeyUp(e.code, e.keyCode);
            });
            addEventListener('resize', () => {
                this.onResize(host.clientWidth || innerWidth, host.clientHeight || innerHeight);
            });
            host.addEventListener('wheel', e => {
                e.preventDefault();
                let p = pos(e);
                this.onMouseWheel(p.x, p.y, p.d);
            }, { passive: false });
        }
    }
    onMouseDown(x, y, button, shift = false) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseDownEvent(x, y, button, shift)) {
                return;
            }
        }
    }
    onMouseUp(x, y, button) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseUpEvent(x, y, button)) {
                return;
            }
        }
    }
    onMouseHover(x, y) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkHoverEvent(x, y)) {
                return;
            }
        }
    }
    onMouseWheel(x, y, dir) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseWheelEvent(x, y, dir)) {
                return;
            }
        }
    }
    onResize(width, height) {
        if (this.layerState === LAYER_OFF) {
            return;
        }
        for (let elem of this.uiElements) {
            elem.checkResizeEvent(width, height);
        }
    }
    onKeyDown(_key, _keyCode) { }
    onKeyUp(_key, _keyCode) { }
    turnOn() {
        this.layerState = LAYER_ON;
    }
    turnOff() {
        this.layerState = LAYER_OFF;
    }
    suspend() {
        this.layerState = LAYER_SUSPEND;
    }
    remove() {
        this.removeFlag = true;
    }
    shouldRemove() {
        return this.removeFlag;
    }
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }
    addUiElement(element) {
        this.uiElements.push(element);
        element.build();
    }
    getUiElement(elementId) {
        for (let elem of this.uiElements) {
            if (elem.getId() === elementId) {
                return elem;
            }
        }
        return null;
    }
    getWindow() {
        return this.window;
    }
    input() { }
    update(dt) {
        for (let elem of this.uiElements) {
            elem.update(dt);
        }
    }
    render(dt) {
        for (let elem of this.uiElements) {
            elem.render(dt);
        }
    }
}
// the smaller this is, the smaller the physics step and
// less chance the ball phases through walls, but more cpu power used
let PHYSICS_DT_MS = 4;
class LayerManager {
    last = performance.now();
    acc = 0;
    layers;
    stateManager;
    constructor(layers, stateManager = null) {
        this.layers = layers;
        this.stateManager = stateManager;
    }
    start() {
        this.updateRender(0);
        requestAnimationFrame(this.loop);
    }
    integrate(dt) {
        for (let layer of this.layers) {
            if (layer.layerState === LAYER_ON) {
                layer.update(dt);
            }
        }
    }
    updateRender(dt) {
        if (this.stateManager) {
            this.stateManager.update(dt);
        }
        for (let i = this.layers.length - 1; i >= 0; i--) {
            if (this.layers[i].shouldRemove()) {
                this.layers.splice(i, 1);
            }
        }
        for (let layer of this.layers) {
            if (layer.layerState === LAYER_OFF) {
                continue;
            }
            layer.render(dt);
        }
    }
    loop = (t) => {
        let dt = Math.min(33, t - this.last);
        this.last = t;
        this.acc += dt;
        while (this.acc >= PHYSICS_DT_MS) {
            this.integrate(PHYSICS_DT_MS);
            this.acc -= PHYSICS_DT_MS;
        }
        this.updateRender(dt);
        requestAnimationFrame(this.loop);
    };
}
// Extra distance the solver pushes a body past the surface, so the next step
// starts outside instead of exactly on the boundary.
let CONTACT_SLOP = 0.01;
// A surface that is moving toward the body has to be outrun, or it overtakes
// the body again on the next substep and applies a second impulse. This is the
// minimum speed a body leaves such a surface with, relative to the surface.
let MIN_SEPARATION_SPEED = 30;
let vecCreate = (x = 0, y = 0) => ({ x, y });
let vecAdd = (a, b) => vecCreate(a.x + b.x, a.y + b.y);
let vecSub = (a, b) => vecCreate(a.x - b.x, a.y - b.y);
let vecMul = (v, s) => vecCreate(v.x * s, v.y * s);
let vecDot = (a, b) => a.x * b.x + a.y * b.y;
let vecLen = (v) => Math.hypot(v.x, v.y);
let vecNorm = (v) => vecMul(v, 1 / (vecLen(v) || 1));
let vecPerp = (v) => vecCreate(-v.y, v.x);
let circleCreate = (x, y, r, m = 1) => ({
    pos: vecCreate(x, y),
    vel: vecCreate(),
    r,
    m,
    invM: 1 / m,
});
let circleApplyImpulse = (c, j) => {
    c.vel = vecAdd(c.vel, vecMul(j, c.invM));
    return c;
};
let GRAVITY = 1200;
let circleIntegrate = (c, dtSeconds, gravity = GRAVITY) => {
    c.vel = vecAdd(c.vel, vecMul(vecCreate(0, gravity), dtSeconds));
    c.pos = vecAdd(c.pos, vecMul(c.vel, dtSeconds));
    return c;
};
let lineCreate = (x1, y1, x2, y2, rest = 0.5) => ({
    a: vecCreate(x1, y1),
    b: vecCreate(x2, y2),
    rest,
});
let lineSet = (l, x1, y1, x2, y2) => {
    l.a.x = x1;
    l.a.y = y1;
    l.b.x = x2;
    l.b.y = y2;
    return l;
};
// The closest point on the segment, plus the clamped parameter that produced
// it. t of exactly 0 or 1 means the closest point is an endpoint cap, which
// needs a radial normal rather than the segment's perpendicular.
let lineClosestPointT = (l, p) => {
    let ab = vecSub(l.b, l.a);
    let abLen2 = vecDot(ab, ab) || 1;
    let t = vecDot(vecSub(p, l.a), ab) / abLen2;
    t = Math.max(0, Math.min(1, t));
    return { point: vecAdd(l.a, vecMul(ab, t)), t };
};
let lineClosestPoint = (l, p) => lineClosestPointT(l, p).point;
/**
 * Resolves one contact between a circle and a surface of infinite mass.
 *
 * `n` is a unit normal pointing from the surface toward the circle and `depth`
 * is how far the circle has to travel along it to be clear. `surfaceVel` is the
 * velocity of the surface at the contact point, or null for a static surface.
 *
 * All of the velocity work happens in the surface's frame of reference. That is
 * what makes a moving surface behave: the bounce is computed against the
 * relative velocity, then the surface velocity is added back once. Adding any
 * fraction of the surface velocity on top of an already-resolved bounce injects
 * energy on every substep of a sustained contact, which is what made the paddle
 * drag the ball around instead of striking it.
 */
let resolveCircleSurface = (c, n, depth, rest, friction, surfaceVel) => {
    if (depth <= 0) {
        return false;
    }
    c.pos = vecAdd(c.pos, vecMul(n, depth + CONTACT_SLOP));
    let rel = surfaceVel ? vecSub(c.vel, surfaceVel) : c.vel;
    let vn = vecDot(rel, n);
    if (vn >= 0) {
        // Already separating in the surface's frame: this is a resting or trailing
        // contact, so correcting the position is the whole job.
        return true;
    }
    let relT = vecSub(rel, vecMul(n, vn));
    let outN = -vn * rest;
    if (surfaceVel && vecDot(surfaceVel, n) > 0 && outN < MIN_SEPARATION_SPEED) {
        outN = MIN_SEPARATION_SPEED;
    }
    // Coulomb friction: the normal impulse can cancel at most `friction` times as
    // much tangential slip.
    let outT = relT;
    let vt = vecLen(relT);
    if (friction > 0 && vt > 1e-6) {
        let maxDrop = friction * (1 + rest) * -vn;
        outT = vecMul(relT, Math.max(0, vt - maxDrop) / vt);
    }
    let newRel = vecAdd(vecMul(n, outN), outT);
    c.vel = surfaceVel ? vecAdd(newRel, surfaceVel) : newRel;
    return true;
};
let resolveCircleLine = (c, l, friction = 0, surfaceVel = null) => {
    let cp = lineClosestPoint(l, c.pos);
    let diff = vecSub(c.pos, cp);
    let dist = vecLen(diff);
    if (dist >= c.r) {
        return false;
    }
    // A centre sitting exactly on the segment has no direction to push along, so
    // fall back to the segment's own perpendicular instead of skipping the hit.
    let n = dist > 1e-6 ? vecMul(diff, 1 / dist) : vecNorm(vecPerp(vecSub(l.b, l.a)));
    return resolveCircleSurface(c, n, c.r - dist, l.rest, friction, surfaceVel);
};
let resolveCircleCircle = (a, b, restitution = 0.8) => {
    let diff = vecSub(b.pos, a.pos);
    let d = vecLen(diff);
    if (d === 0 || d >= a.r + b.r) {
        return;
    }
    let n = vecMul(diff, 1 / d);
    let penetration = a.r + b.r - d;
    let totalInv = a.invM + b.invM;
    a.pos = vecAdd(a.pos, vecMul(n, -penetration * (a.invM / totalInv)));
    b.pos = vecAdd(b.pos, vecMul(n, penetration * (b.invM / totalInv)));
    let rel = vecSub(b.vel, a.vel);
    let vn = vecDot(rel, n);
    if (vn > 0) {
        return;
    }
    let j = (-(1 + restitution) * vn) / totalInv;
    let impulse = vecMul(n, j);
    circleApplyImpulse(a, vecMul(impulse, -1));
    circleApplyImpulse(b, impulse);
};
/** Perimeter edge bits, in the order applyPerimeter walks them. */
let EDGE_TOP = 1;
let EDGE_RIGHT = 2;
let EDGE_BOTTOM = 4;
let EDGE_LEFT = 8;
let EDGE_ALL = 15;
let sectionCreate = (id, x, y, w, h, bg) => ({
    id,
    x,
    y,
    w,
    h,
    walls: [],
    parts: [],
    bg,
});
let sectionContains = (section, x, y) => {
    return (x >= section.x &&
        x <= section.x + section.w &&
        y >= section.y &&
        y <= section.y + section.h);
};
let findSectionAt = (sections, x, y, current) => {
    if (current && sectionContains(current, x, y)) {
        return current;
    }
    for (let i = 0; i < sections.length; i++) {
        if (sectionContains(sections[i], x, y)) {
            return sections[i];
        }
    }
    return current;
};
let isPointInAnySection = (sections, x, y, margin) => {
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        if (x >= s.x - margin &&
            x <= s.x + s.w + margin &&
            y >= s.y - margin &&
            y <= s.y + s.h + margin) {
            return true;
        }
    }
    return false;
};
let forEachPart = (sections, fn) => {
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        for (let j = 0; j < s.parts.length; j++) {
            fn(s.parts[j], s);
        }
    }
};
/**
 * Generates each section's perimeter walls from its rect, its `edges` mask and
 * the level's links, and appends them to section.walls.
 *
 * Two kinds of span are skipped, and they work the same way:
 *  - a link's opening, so the ball can pass between sections;
 *  - a boundary shared with a LOWER-index section, which owns that wall. Both
 *    sides emitting would leave coincident duplicates, doubling the work in
 *    resolveBallWalls for no behavioural difference.
 *
 * A link's `offset` is a world coordinate along the boundary's varying axis, so
 * neither section's origin is privileged.
 */
// let applyPerimeter = (sections: Section[], links: number[][]) => {
//   // skip[section * 4 + edgeIndex] = spans of [lo, hi] in local edge coords,
//   // edgeIndex being 0 top, 1 right, 2 bottom, 3 left.
//   let skip: number[][][] = [];
//   for (let i = 0; i < sections.length * 4; i++) {
//     skip.push([]);
//   }
//   let add = (si: number, edge: number, lo: number, len: number) => {
//     skip[si * 4 + edge].push([lo, lo + len]);
//   };
//   for (let i = 0; i < links.length; i++) {
//     let [ai, bi, off, wide] = links[i];
//     let a = sections[ai];
//     let b = sections[bi];
//     if (a.y + a.h === b.y) {
//       add(ai, 2, off - a.x, wide);
//       add(bi, 0, off - b.x, wide);
//     } else if (b.y + b.h === a.y) {
//       add(ai, 0, off - a.x, wide);
//       add(bi, 2, off - b.x, wide);
//     } else if (a.x + a.w === b.x) {
//       add(ai, 1, off - a.y, wide);
//       add(bi, 3, off - b.y, wide);
//     } else if (b.x + b.w === a.x) {
//       add(ai, 3, off - a.y, wide);
//       add(bi, 1, off - b.y, wide);
//     }
//   }
//   // Shared-boundary ownership. j < i, so j is the owner and i gives up the span.
//   for (let i = 0; i < sections.length; i++) {
//     for (let j = 0; j < i; j++) {
//       let a = sections[i];
//       let b = sections[j];
//       let vertical = a.x + a.w === b.x || b.x + b.w === a.x;
//       let lo = vertical
//         ? Math.max(a.y, b.y)
//         : Math.max(a.x, b.x);
//       let hi = vertical
//         ? Math.min(a.y + a.h, b.y + b.h)
//         : Math.min(a.x + a.w, b.x + b.w);
//       if (lo >= hi) {
//         continue;
//       }
//       if (a.y + a.h === b.y) {
//         add(i, 2, lo - a.x, hi - lo);
//       } else if (b.y + b.h === a.y) {
//         add(i, 0, lo - a.x, hi - lo);
//       } else if (a.x + a.w === b.x) {
//         add(i, 1, lo - a.y, hi - lo);
//       } else if (b.x + b.w === a.x) {
//         add(i, 3, lo - a.y, hi - lo);
//       }
//     }
//   }
//   for (let i = 0; i < sections.length; i++) {
//     let s = sections[i];
//     for (let edge = 0; edge < 4; edge++) {
//       if (!(s.edges & (1 << edge))) {
//         continue;
//       }
//       let spans = skip[i * 4 + edge];
//       spans.sort((p, q) => p[0] - q[0]);
//       let len = edge & 1 ? s.h : s.w;
//       let cursor = 0;
//       for (let k = 0; k <= spans.length; k++) {
//         let stop = k < spans.length ? spans[k][0] : len;
//         if (stop > cursor) {
//           // Walk the edge as a run from `cursor` to `stop` along its axis.
//           s.walls.push(
//             edge === 0
//               ? lineCreate(cursor, 0, stop, 0)
//               : edge === 1
//                 ? lineCreate(s.w, cursor, s.w, stop)
//                 : edge === 2
//                   ? lineCreate(cursor, s.h, stop, s.h)
//                   : lineCreate(0, cursor, 0, stop)
//           );
//         }
//         if (k < spans.length && spans[k][1] > cursor) {
//           cursor = spans[k][1];
//         }
//       }
//     }
//   }
// };
let flattenSectionWalls = (sections) => {
    let walls = [];
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        for (let j = 0; j < s.walls.length; j++) {
            let wall = s.walls[j];
            walls.push(lineCreate(wall.a.x + s.x, wall.a.y + s.y, wall.b.x + s.x, wall.b.y + s.y, wall.rest));
        }
    }
    return walls;
};
class StateManagerInterface {
    static stateManager = null;
    static getStateManager(throwIfNotSet = false) {
        if (throwIfNotSet && !this.stateManager) {
            throw 1;
        }
        return this.stateManager;
    }
    static hasStateManager() {
        return this.stateManager !== null;
    }
    static setStateManager(stateManager) {
        this.stateManager = stateManager;
    }
}
let getStateGlobal = () => {
    return StateManagerInterface.getStateManager(true).getState();
};
let DEBUG_N = 60;
let rollCreate = () => {
    let hist = [];
    for (let i = 0; i < DEBUG_N; i++) {
        hist.push(0);
    }
    return { hist, i: 0, sum: 0, filled: 0 };
};
let rollPush = (roll, value) => {
    roll.sum -= roll.hist[roll.i];
    roll.hist[roll.i] = value;
    roll.sum += value;
    roll.i = (roll.i + 1) % DEBUG_N;
    if (roll.filled < DEBUG_N) {
        roll.filled++;
    }
    return roll.sum / roll.filled;
};
class DebugLayer extends Layer {
    el = null;
    stepsThisFrame = 0;
    stepRoll = rollCreate();
    fpsRoll = rollCreate();
    fps = 0;
    avgSteps = 0;
    constructor() {
        super(null, 'debug');
        let root = getGameRoot();
        if (!root) {
            return;
        }
        let el = createElement(DIV);
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
    update(_dt) {
        this.stepsThisFrame++;
    }
    render(dt) {
        this.avgSteps = rollPush(this.stepRoll, this.stepsThisFrame);
        this.stepsThisFrame = 0;
        this.fps = rollPush(this.fpsRoll, dt > 0 ? 1000 / dt : 0);
        if (!this.el) {
            return;
        }
        let state = getStateGlobal();
        let ball = state.balls[0];
        let speed = 0;
        let zone = 'none';
        if (ball) {
            speed = vecLen(ball.vel);
            let section = findSectionAt(state.sections, ball.pos.x, ball.pos.y, null);
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
let W = 400;
let H = 600;
let BALL_R = 10;
let PADDLE_LEN = 58;
let PADDLE_SPEED = 18;
let PADDLE_RETURN = 10;
// Matches the rendered stroke, so the ball rides on the paddle's face rather
// than sinking to its centre line.
let PADDLE_HALF_WIDTH = 3;
let PADDLE_REST = 0.35;
let PADDLE_FRICTION = 0.25;
// A tip hit adds PADDLE_SPEED * PADDLE_LEN of surface speed on top of whatever
// the ball arrived with, so the cap has to clear that or the kick gets shaved.
let MAX_BALL_SPEED = 1500;
let LAUNCHER_X = 384;
let LAUNCHER_Y = 582;
let LAUNCHER_FORCE = 1250;
let LAUNCHER_RANGE = 36;
let LEFT_PIVOT = { x: 118, y: 450 };
let RIGHT_PIVOT = { x: 282, y: 450 };
let LEFT_REST_ANGLE = 0.45;
let LEFT_UP = -0.55;
let RIGHT_REST_ANGLE = Math.PI - 0.45;
let RIGHT_UP = Math.PI + 0.55;
let ballCreate = (x = 0, y = 0) => {
    let b = circleCreate(x, y, BALL_R, 1);
    return { ...b, color: 'red' };
};
let ballIsOutOfBounds = (ball, sections) => {
    return !isPointInAnySection(sections, ball.pos.x, ball.pos.y, 40);
};
let updateBallMotion = (ball, dtSeconds, gravity = GRAVITY) => {
    circleIntegrate(ball, dtSeconds, gravity);
};
let clampBallSpeed = (ball, maxSpeed = MAX_BALL_SPEED) => {
    let speed = vecLen(ball.vel);
    if (speed > maxSpeed) {
        ball.vel = vecMul(ball.vel, maxSpeed / speed);
    }
};
let resolveBallWalls = (ball, walls, surfaceVel = null) => {
    let hit = false;
    for (let i = 0; i < walls.length; i++) {
        if (resolveCircleLine(ball, walls[i], 0, surfaceVel)) {
            hit = true;
        }
    }
    return hit;
};
let updateParts = (state, dt) => {
    forEachPart(state.sections, (part, section) => {
        // Only player-driven parts follow the input; everything else owns its own
        // active flag (bumper flash timers, permanent fields).
        if (part.control >= 0) {
            let inSection = false;
            for (let i = 0; i < state.balls.length; i++) {
                let p = state.balls[i].pos;
                if (sectionContains(section, p.x, p.y)) {
                    inSection = true;
                    break;
                }
            }
            if (state.input[part.control] && inSection) {
                part.activate();
            }
            else {
                part.unactivate();
            }
        }
        part.update(dt, section);
    });
};
/** Applies pre-integration forces and returns the gravity to integrate with. */
let preBallParts = (ball, state, dtSeconds) => {
    let g = GRAVITY;
    forEachPart(state.sections, (part, section) => {
        g = part.preBall(ball, section.x, section.y, dtSeconds, g);
    });
    return g;
};
let resolveBallParts = (ball, state) => {
    forEachPart(state.sections, (part, section) => {
        part.affectBall(ball, section.x, section.y);
    });
};
let updateSimulation = (state, dt) => {
    let dtSeconds = dt / 1000;
    updateParts(state, dt);
    for (let i = 0; i < state.balls.length; i++) {
        let ball = state.balls[i];
        updateBallMotion(ball, dtSeconds, preBallParts(ball, state, dtSeconds));
        resolveBallWalls(ball, state.walls);
        resolveBallParts(ball, state);
        // A paddle sweeping into a ball can push it through a wall, so give the
        // walls the last word on position.
        resolveBallWalls(ball, state.walls);
        clampBallSpeed(ball);
        if (ballIsOutOfBounds(ball, state.sections)) {
            let start = state.sections[0];
            state.balls[i] = ballCreate(start.x + LAUNCHER_X, start.y + LAUNCHER_Y);
        }
    }
};
class SimLayer extends Layer {
    constructor() {
        super(null, 'sim');
    }
    update(dt) {
        let state = getStateGlobal();
        updateSimulation(state, dt);
    }
    render(dt) {
        // drawBall(this.views.ball, this.game.ball);
        // drawPaddle(this.views.leftPaddle, this.game.leftPaddle);
        // drawPaddle(this.views.rightPaddle, this.game.rightPaddle);
        // super.render(deltaTime);
    }
}
class UiElement {
    parent = null;
    children = [];
    el = null;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    scale = 1;
    id = '';
    isHovered = false;
    isClicked = false;
    shouldPropagateEventsToChildren = true;
    constructor(parent) {
        if (parent) {
            parent.addChild(this);
        }
    }
    getChildById(id) {
        if (this.id === id) {
            return this;
        }
        for (let child of this.children) {
            let found = child.getChildById(id);
            if (found) {
                return found;
            }
        }
        return null;
    }
    removeChildById(id) {
        let child = this.getChildById(id);
        if (!child || !child.parent) {
            return;
        }
        child.parent.removeChildAtIndex(child.parent.children.indexOf(child));
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    setScale(scale) {
        this.scale = scale;
    }
    getPos() {
        return [this.x, this.y];
    }
    getDims() {
        return [this.width * this.scale, this.height * this.scale];
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    getChildren() {
        return this.children;
    }
    getParent() {
        return this.parent;
    }
    getChildHostEl() {
        return this.el;
    }
    removeChildAtIndex(index) {
        if (index < 0 || index >= this.children.length) {
            return;
        }
        this.children[index].parent = null;
        this.children.splice(index, 1);
    }
    addChild(child) {
        if (child.parent) {
            child.parent.removeChildAtIndex(child.parent.children.indexOf(child));
        }
        child.parent = this;
        this.children.push(child);
    }
    hit(mouseX, mouseY) {
        let [width, height] = this.getDims();
        return (mouseX >= this.x &&
            mouseY >= this.y &&
            mouseX <= this.x + width &&
            mouseY <= this.y + height);
    }
    checkMouseDownEvent(mouseX, mouseY, button, shift = false) {
        if (this.shouldPropagateEventsToChildren) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].checkMouseDownEvent(mouseX, mouseY, button, shift)) {
                    return true;
                }
            }
        }
        if (!this.hit(mouseX, mouseY)) {
            return false;
        }
        this.isClicked = true;
        this.onMouseDown(mouseX, mouseY, button, shift);
        return true;
    }
    checkMouseUpEvent(mouseX, mouseY, button) {
        let handled = false;
        if (this.shouldPropagateEventsToChildren) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].checkMouseUpEvent(mouseX, mouseY, button)) {
                    handled = true;
                }
            }
        }
        if (this.isClicked) {
            if (this.hit(mouseX, mouseY)) {
                this.onClick(mouseX, mouseY, button);
                handled = true;
            }
            this.onMouseUp(mouseX, mouseY, button);
            this.isClicked = false;
        }
        return handled;
    }
    checkHoverEvent(mouseX, mouseY) {
        let handled = false;
        if (this.shouldPropagateEventsToChildren) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].checkHoverEvent(mouseX, mouseY)) {
                    handled = true;
                }
            }
        }
        this.isHovered = this.hit(mouseX, mouseY);
        if (this.isHovered) {
            handled = true;
        }
        return handled;
    }
    checkMouseWheelEvent(mouseX, mouseY, delta) {
        if (this.shouldPropagateEventsToChildren) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].checkMouseWheelEvent(mouseX, mouseY, delta)) {
                    return true;
                }
            }
        }
        if (!this.hit(mouseX, mouseY)) {
            return false;
        }
        this.onMouseWheel(mouseX, mouseY, delta);
        return true;
    }
    checkResizeEvent(width, height) {
        for (let child of this.children) {
            child.checkResizeEvent(width, height);
        }
    }
    onMouseDown(_x, _y, _button, _shift = false) { }
    onMouseUp(_x, _y, _button) { }
    onClick(_x, _y, _button) { }
    onMouseWheel(_x, _y, _delta) { }
    build() {
        for (let child of this.children) {
            child.build();
        }
    }
    update(_dt) {
        for (let child of this.children) {
            child.update(_dt);
        }
    }
    render(dt) {
        for (let child of this.children) {
            child.render(dt);
        }
    }
}
class BallElement extends UiElement {
    ball;
    constructor(ball, parent) {
        super(parent);
        this.ball = ball;
        this.setId('ball');
    }
    build() {
        let ball = this.ball;
        let size = ball.r * 2;
        this.width = size;
        this.height = size;
        let svg = createSvgElement(SVG, {
            width: stringify(size),
            height: stringify(size),
            viewBox: '0 0 ' + size + ' ' + size,
        });
        svg.appendChild(createSvgElement(CIRCLE, {
            'cx': stringify(ball.r),
            'cy': stringify(ball.r),
            'r': stringify(ball.r),
            'fill': ball.color,
        }));
        setStyle(svg, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            [POINTER_EVENTS]: 'none',
        });
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, svg);
        }
        this.el = svg;
        this.syncPos();
    }
    update(_dt) {
        this.syncPos();
    }
    render(_dt) { }
    syncPos() {
        let ball = this.ball;
        this.x = ball.pos.x - ball.r;
        this.y = ball.pos.y - ball.r;
        if (this.el) {
            setStyle(this.el, {
                left: px(this.x),
                top: px(this.y),
            });
        }
    }
}
let CONTROL_LEFT = 0;
let CONTROL_RIGHT = 1;
let CONTROL_START = 2;
/** Not player-driven. The input gate in updateParts skips these. */
let CONTROL_NONE = -1;
let PART_PADDLE = 0;
let PART_LAUNCHER = 1;
let PART_OBSTACLE = 2;
let PART_FIELD = 3;
/**
 * Everything that lives in a Section and can touch the ball: paddles,
 * launchers, bumpers, fields. One list, one loop, one UI element — adding a
 * kind costs a `type` constant and the phases it actually cares about, not a
 * new array, foreach, update pass and element class.
 */
class Part {
    x = 0;
    y = 0;
    type = PART_PADDLE;
    control = CONTROL_NONE;
    active = false;
    constructor(x, y, type, control = CONTROL_NONE) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.control = control;
    }
    activate() {
        this.active = true;
    }
    unactivate() {
        this.active = false;
    }
    /** Pre-physics tick: move under your own power. */
    update(_dt, _section) { }
    /**
     * Pre-integration: apply forces to the ball and return the gravity it should
     * integrate with. Returning `g` untouched opts out of both.
     */
    preBall(_ball, _ox, _oy, _dtSeconds, g) {
        return g;
    }
    /** Post-integration: resolve contact. */
    affectBall(_ball, _ox, _oy) { }
}
let LAUNCHER_LEN = 24;
class PartElement extends UiElement {
    part;
    lineEls = [];
    constructor(part, parent) {
        super(parent);
        this.part = part;
    }
    attach(el) {
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, el);
        }
        this.el = el;
    }
    addLine(host, x1, y1, x2, y2, stroke, width) {
        let el = createSvgElement(LINE, {
            x1: stringify(x1),
            y1: stringify(y1),
            x2: stringify(x2),
            y2: stringify(y2),
            stroke,
            'stroke-width': width,
            'stroke-linecap': 'round',
        });
        host.appendChild(el);
        this.lineEls.push(el);
    }
    build() {
        let part = this.part;
        this.setPos(part.x, part.y);
        if (part.type === PART_FIELD) {
            let field = part;
            this.width = field.w;
            this.height = field.h;
            let el = createElement(DIV);
            setStyle(el, {
                position: 'absolute',
                left: px(field.x),
                top: px(field.y),
                width: px(field.w),
                height: px(field.h),
                [POINTER_EVENTS]: 'none',
            });
            this.attach(el);
            this.render(0);
            return;
        }
        let svg = createSvgElement(SVG, {
            width: '1',
            height: '1',
        });
        setStyle(svg, {
            position: 'absolute',
            left: px(part.x),
            top: px(part.y),
            overflow: 'visible',
            [POINTER_EVENTS]: 'none',
        });
        if (part.type === PART_PADDLE) {
            let line = part.getLine();
            this.addLine(svg, 0, 0, line.b.x - line.a.x, line.b.y - line.a.y, '#ccc', '6');
        }
        else if (part.type === PART_LAUNCHER) {
            let dir = part.dir;
            this.addLine(svg, 0, 0, -dir.x * LAUNCHER_LEN, -dir.y * LAUNCHER_LEN, '#c84', '8');
        }
        else {
            let walls = part.walls;
            for (let i = 0; i < walls.length; i++) {
                let w = walls[i];
                this.addLine(svg, w.a.x, w.a.y, w.b.x, w.b.y, '#888', '4');
            }
        }
        this.attach(svg);
    }
    update(_dt) {
        let part = this.part;
        let first = this.lineEls[0];
        if (part.type === PART_PADDLE) {
            if (first) {
                let line = part.getLine();
                setAttribute(first, 'x2', stringify(line.b.x - line.a.x));
                setAttribute(first, 'y2', stringify(line.b.y - line.a.y));
            }
            return;
        }
        if (part.type === PART_LAUNCHER) {
            if (first) {
                setAttribute(first, 'stroke', part.active ? '#fc8' : '#c84');
            }
            return;
        }
        if (part.type === PART_FIELD) {
            let field = part;
            let bg = 'rgba(70,140,220,0.08)';
            if (field.active) {
                bg = field.inside ? 'rgba(120,200,255,0.35)' : 'rgba(70,160,255,0.18)';
            }
            if (this.el) {
                setStyle(this.el, { background: bg });
            }
            return;
        }
        let obstacle = part;
        if (this.el) {
            setStyle(this.el, {
                left: px(obstacle.x),
                top: px(obstacle.y),
                'transform-origin': '0 0',
                [TRANSFORM]: 'rotate(' + obstacle.angle + 'rad)',
            });
        }
        let stroke = obstacle.active ? '#fc8' : '#888';
        for (let i = 0; i < this.lineEls.length; i++) {
            setAttribute(this.lineEls[i], 'stroke', stroke);
        }
    }
}
class BoardSection extends UiElement {
    section;
    constructor(section, parent) {
        super(parent);
        this.section = section;
        this.setId(stringify(section.id));
        this.setPos(section.x, section.y);
        this.width = section.w;
        this.height = section.h;
    }
    build() {
        let section = this.section;
        let el = createElement(DIV);
        setStyle(el, {
            position: 'absolute',
            left: px(section.x),
            top: px(section.y),
            width: px(section.w),
            height: px(section.h),
            background: section.bg,
        });
        let svg = createSvgElement(SVG, {
            width: stringify(section.w),
            height: stringify(section.h),
            viewBox: '0 0 ' + section.w + ' ' + section.h,
        });
        setStyle(svg, {
            position: 'absolute',
            inset: '0',
        });
        for (let wall of section.walls) {
            svg.appendChild(createSvgElement(LINE, {
                x1: stringify(wall.a.x),
                y1: stringify(wall.a.y),
                x2: stringify(wall.b.x),
                y2: stringify(wall.b.y),
                stroke: '#888',
                'stroke-width': '4',
                'stroke-linecap': 'round',
            }));
        }
        appendChild(el, svg);
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, el);
        }
        this.el = el;
        for (let i = 0; i < section.parts.length; i++) {
            let child = new PartElement(section.parts[i]);
            this.addChild(child);
            child.build();
        }
    }
    render(dt) {
        super.render(dt);
    }
}
let CAM_SCALE_MIN = 0.25;
let CAM_SCALE_MAX = 4;
let CAM_SCALE_STEP = 1.1;
let CAM_PAN_MS = 300;
let getCamPan = (section, viewW, viewH, scale) => {
    return {
        x: section.x + section.w / 2 - viewW / (2 * scale),
        y: section.y + section.h / 2 - viewH / (2 * scale),
    };
};
let clampCamScale = (scale) => {
    if (scale < CAM_SCALE_MIN) {
        return CAM_SCALE_MIN;
    }
    if (scale > CAM_SCALE_MAX) {
        return CAM_SCALE_MAX;
    }
    return scale;
};
let lerpCam = (cur, target, dt) => {
    let t = Math.min(1, dt / CAM_PAN_MS);
    return cur + (target - cur) * t;
};
class Board extends UiElement {
    worldEl = null;
    balls = [];
    section = null;
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
    getChildHostEl() {
        return this.worldEl;
    }
    addBall(ball) {
        let el = new BallElement(ball);
        this.addChild(el);
        if (this.worldEl) {
            el.build();
        }
        return el;
    }
    getBallElements() {
        return this.balls;
    }
    removeBall(ball) {
        let i = this.balls.indexOf(ball);
        if (i < 0) {
            return;
        }
        this.removeChildAtIndex(this.children.indexOf(ball));
    }
    syncBalls() {
        let state = getStateGlobal();
        for (let ball of state.balls) {
            if (!this.balls.some(el => {
                return el.ball === ball;
            })) {
                this.addBall(ball);
            }
        }
        for (let el of this.balls.slice()) {
            if (state.balls.indexOf(el.ball) < 0) {
                this.removeBall(el);
            }
        }
    }
    addChild(child) {
        super.addChild(child);
        if (child instanceof BallElement && this.balls.indexOf(child) < 0) {
            this.balls.push(child);
        }
    }
    removeChildAtIndex(index) {
        let child = this.children[index];
        if (child instanceof BallElement) {
            let i = this.balls.indexOf(child);
            if (i >= 0) {
                this.balls.splice(i, 1);
            }
        }
        let host = this.getChildHostEl();
        if (child && child.el && host) {
            removeChild(host, child.el);
        }
        super.removeChildAtIndex(index);
    }
    readViewSize() {
        let root = getGameRoot();
        let w = (root && root.clientWidth) || innerWidth;
        let h = (root && root.clientHeight) || innerHeight;
        this.width = w;
        this.height = h;
    }
    setPanTarget(section, snap) {
        let pan = getCamPan(section, this.width, this.height, this.camScale);
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
            [TRANSFORM]: 'scale(' +
                this.camScale +
                ') translate(' +
                -this.camX +
                'px,' +
                -this.camY +
                'px)',
        });
    }
    build() {
        let state = getStateGlobal();
        let root = getGameRoot();
        if (!root) {
            return;
        }
        this.readViewSize();
        let el = createElement(DIV);
        setStyle(el, {
            position: 'absolute',
            inset: '0',
            overflow: 'hidden',
            background: '#222',
        });
        appendChild(root, el);
        let worldEl = createElement(DIV);
        setStyle(worldEl, {
            position: 'absolute',
            left: '0px',
            top: '0px',
        });
        appendChild(el, worldEl);
        this.el = el;
        this.worldEl = worldEl;
        for (let section of state.sections) {
            let room = new BoardSection(section);
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
    checkResizeEvent(width, height) {
        this.width = width;
        this.height = height;
        if (this.section) {
            this.setPanTarget(this.section, true);
            this.applyCamera();
        }
        super.checkResizeEvent(width, height);
    }
    onMouseWheel(_x, _y, delta) {
        if (delta > 0) {
            this.camScale = clampCamScale(this.camScale / CAM_SCALE_STEP);
        }
        else {
            this.camScale = clampCamScale(this.camScale * CAM_SCALE_STEP);
        }
        if (this.section) {
            this.setPanTarget(this.section, true);
        }
        this.applyCamera();
    }
    onMouseDown(x, y, _button, shift = false) {
        if (!shift) {
            return;
        }
        let wx = this.camX + x / this.camScale;
        let wy = this.camY + y / this.camScale;
        let state = getStateGlobal();
        let section = findSectionAt(state.sections, wx, wy, null);
        if (!section) {
            return;
        }
        let ball = state.balls[0];
        if (!ball) {
            return;
        }
        ball.pos.x = wx;
        ball.pos.y = wy;
        ball.vel.x = 0;
        ball.vel.y = 0;
    }
    update(dt) {
        this.syncBalls();
        let state = getStateGlobal();
        let ball = state.balls[0];
        if (ball) {
            let next = findSectionAt(state.sections, ball.pos.x, ball.pos.y, this.section);
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
    render(dt) {
        super.render(dt);
    }
}
class SimUiLayer extends Layer {
    constructor(parent) {
        super(parent, 'ui');
        this.addUiElement(new Board());
        this.onResize(parent.clientWidth || innerWidth, parent.clientHeight || innerHeight);
    }
    setControl(key, down) {
        let state = getStateGlobal();
        if (key === 'KeyZ' || key === 'ArrowLeft') {
            state.input[CONTROL_LEFT] = down;
        }
        else if (key === 'Slash' || key === 'ArrowRight') {
            state.input[CONTROL_RIGHT] = down;
        }
        else if (key === 'Space' || key === 'Enter') {
            state.input[CONTROL_START] = down;
        }
    }
    onKeyDown(key, _keyCode) {
        this.setControl(key, true);
    }
    onKeyUp(key, _keyCode) {
        this.setControl(key, false);
    }
}
class Launcher extends Part {
    dir;
    force = 0;
    range = 0;
    fired = false;
    constructor(x, y, control, dx, dy, force, range) {
        super(x, y, PART_LAUNCHER, control);
        this.dir = vecNorm(vecCreate(dx, dy));
        this.force = force;
        this.range = range;
    }
    unactivate() {
        this.active = false;
        this.fired = false;
    }
    affectBall(ball, ox, oy) {
        if (!this.active || this.fired) {
            return;
        }
        let dx = ball.pos.x - (this.x + ox);
        let dy = ball.pos.y - (this.y + oy);
        if (dx * dx + dy * dy > this.range * this.range) {
            return;
        }
        ball.vel = vecMul(this.dir, this.force);
        this.fired = true;
    }
}
let FLASH_MS = 120;
class Obstacle extends Part {
    vx = 0;
    vy = 0;
    angle = 0;
    omega = 0;
    walls = [];
    worldWalls = [];
    alwaysSolid = true;
    touching = false;
    flash = 0;
    constructor(x, y, type, walls, vx = 0, vy = 0, omega = 0) {
        super(x, y, type);
        this.vx = vx;
        this.vy = vy;
        this.omega = omega;
        this.walls = walls;
        for (let i = 0; i < walls.length; i++) {
            this.worldWalls.push(lineCreate(0, 0, 0, 0, walls[i].rest));
        }
    }
    onHit() {
        this.activate();
        this.flash = FLASH_MS;
    }
    update(dt, section) {
        let dtSeconds = dt / 1000;
        if (this.flash > 0) {
            this.flash -= dt;
            if (this.flash <= 0) {
                this.unactivate();
            }
        }
        this.x += this.vx * dtSeconds;
        this.y += this.vy * dtSeconds;
        this.angle += this.omega * dtSeconds;
        if (this.x < 0) {
            this.x = 0;
            if (this.vx < 0) {
                this.vx = -this.vx;
            }
        }
        else if (this.x > section.w) {
            this.x = section.w;
            if (this.vx > 0) {
                this.vx = -this.vx;
            }
        }
        if (this.y < 0) {
            this.y = 0;
            if (this.vy < 0) {
                this.vy = -this.vy;
            }
        }
        else if (this.y > section.h) {
            this.y = section.h;
            if (this.vy > 0) {
                this.vy = -this.vy;
            }
        }
    }
    affectBall(ball, ox, oy) {
        if (!this.active && !this.alwaysSolid) {
            this.touching = false;
            return;
        }
        let wx = this.x + ox;
        let wy = this.y + oy;
        let ca = Math.cos(this.angle);
        let sa = Math.sin(this.angle);
        for (let i = 0; i < this.walls.length; i++) {
            let w = this.walls[i];
            lineSet(this.worldWalls[i], w.a.x * ca - w.a.y * sa + wx, w.a.x * sa + w.a.y * ca + wy, w.b.x * ca - w.b.y * sa + wx, w.b.x * sa + w.b.y * ca + wy);
        }
        let hit = resolveBallWalls(ball, this.worldWalls, vecCreate(this.vx - this.omega * (ball.pos.y - wy), this.vy + this.omega * (ball.pos.x - wx)));
        if (hit && !this.touching) {
            this.onHit();
        }
        this.touching = hit;
    }
}
let makeCircleWalls = (r, n, rest) => {
    let walls = [];
    for (let i = 0; i < n; i++) {
        let a0 = (i / n) * Math.PI * 2;
        let a1 = ((i + 1) / n) * Math.PI * 2;
        walls.push(lineCreate(r * Math.cos(a0), r * Math.sin(a0), r * Math.cos(a1), r * Math.sin(a1), rest));
    }
    return walls;
};
let makeCircle = (x, y, resolution, restitution, radius, vx = 0, vy = 0, omega = 0) => {
    let o = new Obstacle(x, y, PART_OBSTACLE, makeCircleWalls(radius, resolution, restitution), vx, vy, omega);
    return o;
};
/** A round bumper: n-gon walls, flashes and kicks the ball back on contact. */
let makeBumper = (x, y, r, n, rest = 1.2, vx = 0, vy = 0, omega = 0) => new Obstacle(x, y, PART_OBSTACLE, makeCircleWalls(r, n, rest), vx, vy, omega);
class Paddle extends Part {
    angle = 0;
    prevAngle = 0;
    restAngle = 0;
    upAngle = 0;
    len = PADDLE_LEN;
    omega = 0;
    line;
    worldLine;
    constructor(x, y, control, restAngle, upAngle) {
        super(x, y, PART_PADDLE, control);
        this.restAngle = restAngle;
        this.upAngle = upAngle;
        this.angle = restAngle;
        this.prevAngle = restAngle;
        this.line = lineCreate(x, y, x, y);
        this.worldLine = lineCreate(x, y, x, y, PADDLE_REST);
        this.syncLine();
    }
    syncLine() {
        lineSet(this.line, this.x, this.y, this.x + this.len * Math.cos(this.angle), this.y + this.len * Math.sin(this.angle));
    }
    getLine() {
        return this.line;
    }
    /** Velocity of the paddle's surface at a world point: omega cross r. */
    getSurfaceVel(p, pivotX, pivotY) {
        return vecCreate(-this.omega * (p.y - pivotY), this.omega * (p.x - pivotX));
    }
    /**
     * Which face of the paddle a world point lies on, +1 or -1, measured against
     * the paddle at `angle`.
     */
    sideOf(p, pivotX, pivotY, angle) {
        let cross = Math.cos(angle) * (p.y - pivotY) - Math.sin(angle) * (p.x - pivotX);
        return cross < 0 ? -1 : 1;
    }
    affectBall(ball, ox, oy) {
        let pivotX = this.x + ox;
        let pivotY = this.y + oy;
        let dirX = Math.cos(this.angle);
        let dirY = Math.sin(this.angle);
        lineSet(this.worldLine, pivotX, pivotY, pivotX + this.len * dirX, pivotY + this.len * dirY);
        let reach = ball.r + PADDLE_HALF_WIDTH;
        let { point, t } = lineClosestPointT(this.worldLine, ball.pos);
        let diff = vecSub(ball.pos, point);
        let dist = vecLen(diff);
        if (dist >= reach) {
            return;
        }
        // Orient the normal by the face the ball was on *before* this step's sweep.
        // Deriving it from the current position flips it the moment the paddle
        // rotates past the ball's centre, and the correction then fires the ball
        // back into the swept path to be hit again — the stick-and-drag artifact.
        let side = this.sideOf(ball.pos, pivotX, pivotY, this.prevAngle);
        let faceN = vecCreate(-dirY * side, dirX * side);
        // Along the paddle's length the contact is against its flat face; past
        // either end it is against a round cap, so the normal is radial there.
        let n = t > 0 && t < 1
            ? faceN
            : dist > 1e-6
                ? vecMul(diff, 1 / dist)
                : faceN;
        // Signed depth: negative dot means the sweep has already carried the paddle
        // through the ball, so push it back out the side it entered from.
        let depth = reach - (diff.x * n.x + diff.y * n.y);
        resolveCircleSurface(ball, n, depth, PADDLE_REST, PADDLE_FRICTION, this.getSurfaceVel(point, pivotX, pivotY));
    }
    update(dt) {
        let dtSeconds = dt / 1000;
        this.prevAngle = this.angle;
        let target = this.active ? this.upAngle : this.restAngle;
        let speed = this.active ? PADDLE_SPEED : PADDLE_RETURN;
        let maxStep = speed * dtSeconds;
        let diff = target - this.angle;
        if (Math.abs(diff) <= maxStep) {
            this.omega = dtSeconds > 0 ? diff / dtSeconds : 0;
            this.angle = target;
        }
        else {
            let dir = diff < 0 ? -1 : 1;
            this.omega = dir * speed;
            this.angle += dir * maxStep;
        }
        this.syncLine();
    }
}
let START = 0;
let BG = ['#555', '#466', '#645'];
let B_WALLS = 0;
let B_LAUNCHER = 2;
// let B_BUMPER = 3;
// let B_FIELD = 4;
let B_FLIPPER_LEFT = 5;
let B_CIRCLE = 6;
let SECTION_SIDE_BOTTOM = 0;
let SECTION_SIDE_TOP = 1;
let SECTION_SIDE_LEFT = 2;
let SECTION_SIDE_RIGHT = 3;
/**
 * Builders turn a handful of numbers into geometry. Each may push walls, parts
 * or both — a flipper pair owns its inlane slopes as much as its paddles — and
 * they expand at runtime so the data stays small and stays retunable in one
 * place.
 */
let BUILDERS = [];
BUILDERS[B_WALLS] = (section, wallList) => {
    for (let i = 0; i < wallList.length; i += 4) {
        section.walls.push(lineCreate(wallList[i], wallList[i + 1], wallList[i + 2], wallList[i + 3]));
    }
};
BUILDERS[B_FLIPPER_LEFT] = (section, [x, y, restAngle, upAngle, isFlipped]) => {
    let rest = restAngle || LEFT_REST_ANGLE;
    let up = upAngle || LEFT_UP;
    section.parts.push(new Paddle(x, y, isFlipped ? CONTROL_RIGHT : CONTROL_LEFT, isFlipped ? Math.PI - rest : rest, isFlipped ? Math.PI - up : up));
};
BUILDERS[B_LAUNCHER] = (s, [x, y, dx, dy, force, range]) => {
    s.parts.push(new Launcher(x, y, CONTROL_START, dx || 0, dy || -1, force || LAUNCHER_FORCE, range || LAUNCHER_RANGE));
};
BUILDERS[B_CIRCLE] = (section, [x, y, resolution, restitution, radius, dx, dy, omega]) => {
    let circle = makeCircle(x, y, resolution, restitution, radius, dx || 0, dy || 0, omega || 0);
    section.parts.push(circle);
};
// assumes an edge can only have one hole in it at max
let buildSectionEdges = (sections, links) => {
    let walls = BUILDERS[B_WALLS];
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        let { w, h } = s;
        // bottom, top, left, right — index matches SECTION_SIDE_*
        let edges = [
            [0, h, w, h],
            [0, 0, w, 0],
            [0, 0, 0, h],
            [w, 0, w, h],
        ];
        for (let e = 0; e < 4; e++) {
            let [x0, y0, x1, y1] = edges[e];
            let o = 0;
            let g = 0;
            for (let k = 0; k < links.length; k++) {
                let l = links[k];
                if (l[0] === i && l[1] === e) {
                    o = l[2];
                    g = o + l[3];
                    break;
                }
            }
            if (g) {
                walls(s, y0 === y1
                    ? [x0, y0, o, y0, g, y0, x1, y0]
                    : [x0, y0, x0, o, x0, g, x0, y1]);
            }
            else {
                walls(s, [x0, y0, x1, y1]);
            }
        }
    }
};
let buildLevel = (sectionData, links) => {
    let sections = sectionData.map((d, i) => sectionCreate(i, d[0], d[1], d[2], d[3], BG[d[4]]));
    buildSectionEdges(sections, links);
    for (let i = 0; i < sectionData.length; i++) {
        let calls = sectionData[i][5];
        for (let j = 0; j < calls.length; j++) {
            BUILDERS[calls[j][0]](sections[i], calls[j].slice(1));
        }
    }
    return sections;
};
/**
 * x, y, w, h, bg, builder calls.
 * Generated by the editor.
 */
let SECTIONS = [
    [
        0,
        0,
        400,
        600,
        0,
        [
            [
                B_WALLS,
                0, 419, 122, 463,
                369, 420, 275, 462,
                372, 573, 372, 600,
                0, 500, 373, 560,
                372, 596, 400, 596,
                350, 200, 400, 280,
                350, 200, 400, 108,
                369, 301, 369, 534
            ],
            [B_FLIPPER_LEFT, 123, 471, 0, 0],
            [B_FLIPPER_LEFT, 275, 470, 0, 0, 1],
            [B_LAUNCHER, 384, 582],
            [B_CIRCLE, 95, 179, 10, 1.2, 40, 22, 0, 1.2],
            [B_CIRCLE, 288, 92, 10, 1.2, 40, 22, 0, 1.2],
        ],
    ],
    [
        0,
        -400,
        400,
        400,
        1,
        [
            [
                B_WALLS,
                0, 146, 163, 0,
                66, 342, 0, 318,
                20, 302, 75, 208,
                217, 69, 358, 48,
                297, 199, 338, 214,
                297, 400, 400, 306,
                52, 372, 102, 400,
                42, 339, 52, 371,
                254, 111, 400, 102,
                145, 400, 135, 369
            ],
            [B_FLIPPER_LEFT, 67, 350, 0, -0.55],
            [B_CIRCLE, 230, 263, 3, 1, 40, 12, 0, 0],
            [B_LAUNCHER, 153, 370],
        ],
    ],
    [400, -400, 640, 400, 2, []],
];
/** section, side, localOffset, width */
let LINKS = [
    [0, SECTION_SIDE_TOP, 179, 100],
    [1, SECTION_SIDE_BOTTOM, 179, 100],
    [1, SECTION_SIDE_RIGHT, 150, 100],
    [2, SECTION_SIDE_LEFT, 150, 100],
];
let createState = () => {
    let sections = buildLevel(SECTIONS, LINKS);
    return {
        balls: [ballCreate(LAUNCHER_X, LAUNCHER_Y)],
        sections,
        walls: flattenSectionWalls(sections),
        input: [false, false, false],
    };
};
class StateManager {
    state;
    actionData;
    constructor(state) {
        this.state = state || createState();
        this.actionData = {
            sequentialActions: [],
            sequentialActionsNext: [],
            insertActions: [],
            parallelActions: [],
        };
    }
    getState() {
        return this.state;
    }
    getActionData() {
        return this.actionData;
    }
    enqueueAction(actions, action, ms = 0) {
        actions.sequentialActionsNext.push(this.wrap(action, ms));
    }
    insertAction(actions, action, ms = 0) {
        actions.insertActions.push(this.wrap(action, ms));
    }
    pllAction(actions, action, ms = 0) {
        actions.parallelActions.push(this.wrap(action, ms));
    }
    moveSequentialActions(actions) {
        for (let item of actions.sequentialActionsNext) {
            actions.sequentialActions.push(item);
        }
        actions.sequentialActionsNext.length = 0;
    }
    moveInsertActions(actions) {
        let inserted = actions.insertActions;
        for (let i = inserted.length - 1; i >= 0; i--) {
            actions.sequentialActions.unshift(inserted[i]);
        }
        inserted.length = 0;
    }
    update(dt) {
        let actions = this.actionData;
        for (let i = actions.parallelActions.length - 1; i >= 0; i--) {
            let item = actions.parallelActions[i];
            item.timer -= dt;
            if (item.timer <= 0) {
                item.action.execute(this.state);
                actions.parallelActions.splice(i, 1);
            }
        }
        if (actions.sequentialActions.length) {
            let head = actions.sequentialActions[0];
            head.timer -= dt;
            if (head.timer <= 0) {
                actions.sequentialActions.shift();
                head.action.execute(this.state);
            }
        }
        this.moveInsertActions(actions);
        this.moveSequentialActions(actions);
    }
    wrap(action, ms) {
        action.stateManager = this;
        return { action, timer: ms };
    }
}
let startGame = () => {
    let root = getGameRoot();
    if (!root) {
        console.error('Game root not found');
        return;
    }
    console.log('Start Game.');
    let state = createState();
    let stateManager = new StateManager(state);
    StateManagerInterface.setStateManager(stateManager);
    new LayerManager([new SimLayer(), new SimUiLayer(root), new DebugLayer()], stateManager).start();
};
addEventListener('load', startGame);
class Field extends Part {
    w = 0;
    h = 0;
    permanent = true;
    inside = false;
    grav = 1;
    ax = 0;
    ay = 0;
    drag = 0;
    maxSpeed = 0;
    constructor(x, y, w, h, grav = 1, ax = 0, ay = 0, maxSpeed = 0) {
        super(x, y, PART_FIELD);
        this.active = true;
        this.w = w;
        this.h = h;
        this.grav = grav;
        this.ax = ax;
        this.ay = ay;
        this.maxSpeed = maxSpeed;
    }
    unactivate() {
        if (!this.permanent) {
            this.active = false;
        }
    }
    contains(px, py, ox, oy) {
        let x = this.x + ox;
        let y = this.y + oy;
        return px >= x && px <= x + this.w && py >= y && py <= y + this.h;
    }
    onEnter() { }
    onExit() { }
    preBall(ball, ox, oy, dtSeconds, g) {
        let inNow = this.active && this.contains(ball.pos.x, ball.pos.y, ox, oy);
        if (inNow && !this.inside) {
            this.onEnter();
        }
        else if (!inNow && this.inside) {
            this.onExit();
        }
        this.inside = inNow;
        if (!inNow) {
            return g;
        }
        ball.vel.x += this.ax * dtSeconds;
        ball.vel.y += this.ay * dtSeconds;
        if (this.drag > 0) {
            ball.vel = vecMul(ball.vel, Math.max(0, 1 - this.drag * dtSeconds));
        }
        if (this.maxSpeed > 0) {
            let speed = vecLen(ball.vel);
            if (speed > this.maxSpeed) {
                ball.vel = vecMul(ball.vel, this.maxSpeed / speed);
            }
        }
        return g * this.grav;
    }
}
class AbstractAction {
    state = null;
    stateManager = null;
    act() { }
    getName() {
        return this.constructor.name;
    }
    setState(state) {
        this.state = state;
    }
    execute(state) {
        this.state = state;
        this.act();
    }
    insertAction(action, ms = 0) {
        if (!this.stateManager) {
            return;
        }
        this.stateManager.insertAction(this.stateManager.getActionData(), action, ms);
    }
    enqueueAction(action, ms = 0) {
        if (!this.stateManager) {
            return;
        }
        this.stateManager.enqueueAction(this.stateManager.getActionData(), action, ms);
    }
}
