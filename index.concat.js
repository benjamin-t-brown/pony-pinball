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
            'pointer-events': 'none',
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
                zone = section.id;
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
let ballCreate = (x = 0, y = 0) => {
    let b = circleCreate(x, y, BALL_R, 1);
    return { ...b, color: 'red' };
};
let ballIsOutOfBounds = (ball, sections) => {
    return !isPointInAnySection(sections, ball.pos.x, ball.pos.y, 40);
};
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
let LAUNCHER_FORCE = 850;
let LAUNCHER_RANGE = 36;
let LEFT_PIVOT = { x: 118, y: 520 };
let RIGHT_PIVOT = { x: 282, y: 520 };
let LEFT_REST = 0.45;
let LEFT_UP = -0.55;
let RIGHT_REST = Math.PI - 0.45;
let RIGHT_UP = Math.PI + 0.55;
let makeCircleWalls = (r, n, rest = 1.2) => {
    let walls = [];
    for (let i = 0; i < n; i++) {
        let a0 = (i / n) * Math.PI * 2;
        let a1 = ((i + 1) / n) * Math.PI * 2;
        walls.push(lineCreate(r * Math.cos(a0), r * Math.sin(a0), r * Math.cos(a1), r * Math.sin(a1), rest));
    }
    return walls;
};
class CircleObstacle extends Obstacle {
    flash = 0;
    constructor(x, y, r, n, rest = 1.2) {
        super(x, y, makeCircleWalls(r, n, rest));
    }
    onHit() {
        this.activate();
        this.flash = 120;
    }
    update(dt) {
        if (this.flash > 0) {
            this.flash -= dt;
            if (this.flash <= 0) {
                this.unactivate();
            }
        }
    }
}
class Obstacle {
    x = 0;
    y = 0;
    walls = [];
    worldWalls = [];
    active = false;
    alwaysSolid = true;
    touching = false;
    constructor(x, y, walls) {
        this.x = x;
        this.y = y;
        this.walls = walls;
        for (let i = 0; i < walls.length; i++) {
            this.worldWalls.push(lineCreate(0, 0, 0, 0, walls[i].rest));
        }
    }
    activate() {
        this.active = true;
    }
    unactivate() {
        this.active = false;
    }
    onHit() {
        this.activate();
    }
    update(_dt) { }
    affectBall(ball, ox, oy) {
        if (!this.active && !this.alwaysSolid) {
            this.touching = false;
            return;
        }
        let wx = this.x + ox;
        let wy = this.y + oy;
        let hit = false;
        for (let i = 0; i < this.walls.length; i++) {
            let w = this.walls[i];
            let ww = this.worldWalls[i];
            lineSet(ww, w.a.x + wx, w.a.y + wy, w.b.x + wx, w.b.y + wy);
            if (resolveCircleLine(ball, ww)) {
                hit = true;
            }
        }
        if (hit && !this.touching) {
            this.onHit();
        }
        this.touching = hit;
    }
}
let sectionCreate = (id, x, y, w, h, walls, bg, widgets = []) => ({
    id,
    x,
    y,
    w,
    h,
    walls,
    widgets,
    bg,
});
let placeAdjacent = (anchor, side, w, h) => {
    if (side === 'above') {
        return { x: anchor.x, y: anchor.y - h };
    }
    if (side === 'below') {
        return { x: anchor.x, y: anchor.y + anchor.h };
    }
    if (side === 'left') {
        return { x: anchor.x - w, y: anchor.y };
    }
    return { x: anchor.x + anchor.w, y: anchor.y };
};
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
let getSection = (sections, id) => {
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].id === id) {
            return sections[i];
        }
    }
    return sections[0];
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
let forEachWidget = (sections, fn) => {
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        for (let j = 0; j < s.widgets.length; j++) {
            fn(s.widgets[j], s);
        }
    }
};
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
class Launcher extends Widget {
    dir;
    force = 0;
    range = 0;
    fired = false;
    constructor(x, y, control, dx, dy, force, range) {
        super(x, y, WIDGET_LAUNCHER, control);
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
class Paddle extends Widget {
    angle = 0;
    prevAngle = 0;
    restAngle = 0;
    upAngle = 0;
    len = PADDLE_LEN;
    omega = 0;
    line;
    worldLine;
    constructor(x, y, control, restAngle, upAngle) {
        super(x, y, WIDGET_PADDLE, control);
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
let CONTROL_LEFT = 0;
let CONTROL_RIGHT = 1;
let CONTROL_START = 2;
let WIDGET_PADDLE = 0;
let WIDGET_LAUNCHER = 1;
class Widget {
    x = 0;
    y = 0;
    type = WIDGET_PADDLE;
    control = CONTROL_LEFT;
    active = false;
    constructor(x, y, type, control) {
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
    update(_dt) { }
    affectBall(_ball, _ox, _oy) { }
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
let circleIntegrate = (c, dtSeconds, gravity = 900) => {
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
let resolveCircleLine = (c, l, friction = 0) => {
    let cp = lineClosestPoint(l, c.pos);
    let diff = vecSub(c.pos, cp);
    let dist = vecLen(diff);
    if (dist >= c.r) {
        return false;
    }
    // A centre sitting exactly on the segment has no direction to push along, so
    // fall back to the segment's own perpendicular instead of skipping the hit.
    let n = dist > 1e-6 ? vecMul(diff, 1 / dist) : vecNorm(vecPerp(vecSub(l.b, l.a)));
    return resolveCircleSurface(c, n, c.r - dist, l.rest, friction, null);
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
let updateBallMotion = (ball, dtSeconds) => {
    circleIntegrate(ball, dtSeconds);
};
let clampBallSpeed = (ball, maxSpeed = MAX_BALL_SPEED) => {
    let speed = vecLen(ball.vel);
    if (speed > maxSpeed) {
        ball.vel = vecMul(ball.vel, maxSpeed / speed);
    }
};
let resolveBallWalls = (ball, walls) => {
    for (let wall of walls) {
        resolveCircleLine(ball, wall);
    }
};
let updateWidgets = (state, dt) => {
    forEachWidget(state.sections, (widget, section) => {
        let inSection = false;
        for (let i = 0; i < state.balls.length; i++) {
            let p = state.balls[i].pos;
            if (sectionContains(section, p.x, p.y)) {
                inSection = true;
                break;
            }
        }
        if (state.input[widget.control] && inSection) {
            widget.activate();
        }
        else {
            widget.unactivate();
        }
        widget.update(dt);
    });
};
let resolveBallWidgets = (ball, state) => {
    forEachWidget(state.sections, (widget, section) => {
        widget.affectBall(ball, section.x, section.y);
    });
};
let updateSimulation = (state, dt) => {
    let dtSeconds = dt / 1000;
    updateWidgets(state, dt);
    for (let i = 0; i < state.balls.length; i++) {
        let ball = state.balls[i];
        updateBallMotion(ball, dtSeconds);
        resolveBallWalls(ball, state.walls);
        resolveBallWidgets(ball, state);
        // A paddle sweeping into a ball can push it through a wall, so give the
        // walls the last word on position.
        resolveBallWalls(ball, state.walls);
        clampBallSpeed(ball);
        if (ballIsOutOfBounds(ball, state.sections)) {
            let start = getSection(state.sections, 'start');
            state.balls[i] = ballCreate(start.x + LAUNCHER_X, start.y + LAUNCHER_Y);
        }
    }
};
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
let createState = () => {
    let start = sectionCreate('start', 0, 0, W, H, createStartWalls(W, H), '#555', [
        new Paddle(LEFT_PIVOT.x, LEFT_PIVOT.y, CONTROL_LEFT, LEFT_REST, LEFT_UP),
        new Paddle(RIGHT_PIVOT.x, RIGHT_PIVOT.y, CONTROL_RIGHT, RIGHT_REST, RIGHT_UP),
        new Launcher(LAUNCHER_X, LAUNCHER_Y, CONTROL_START, -0.22, -1, LAUNCHER_FORCE, LAUNCHER_RANGE),
    ]);
    let upperPos = placeAdjacent(start, 'above', 400, 400);
    let upper = sectionCreate('upper', upperPos.x, upperPos.y, 400, 400, createUpperWalls(400, 400), '#466');
    let sidePos = placeAdjacent(upper, 'right', 640, 400);
    let side = sectionCreate('side', sidePos.x, sidePos.y, 640, 400, createSideWalls(640, 400), '#645');
    let sections = [start, upper, side];
    return {
        balls: [ballCreate(LAUNCHER_X, LAUNCHER_Y)],
        sections,
        walls: flattenSectionWalls(sections),
        input: [false, false, false],
    };
};
let createStartWalls = (w, h) => {
    let lane = 372;
    return [
        lineCreate(0, 0, 0, h),
        lineCreate(w, 0, w, h),
        lineCreate(0, 0, 150, 0),
        lineCreate(250, 0, w, 0),
        lineCreate(20, 140, 90, 280),
        lineCreate(w - 20, 140, w - 90, 280),
        lineCreate(90, 280, 130, 430),
        lineCreate(w - 90, 280, w - 130, 430),
        lineCreate(20, 470, 110, 510),
        lineCreate(lane, 470, w - 110, 510),
        lineCreate(lane, 470, lane, 568),
        lineCreate(0, 560, lane, h - 4),
        lineCreate(lane, h - 4, w, h - 4),
    ];
};
let createUpperWalls = (w, h) => {
    return [
        lineCreate(0, 0, w, 0),
        lineCreate(0, 0, 0, h),
        lineCreate(0, h, 150, h),
        lineCreate(250, h, w, h),
        lineCreate(w, 0, w, 150),
        lineCreate(w, 250, w, h),
    ];
};
let createSideWalls = (w, h) => {
    return [
        lineCreate(0, 0, w, 0),
        lineCreate(w, 0, w, h),
        lineCreate(0, h, w, h),
        lineCreate(0, 0, 0, 150),
        lineCreate(0, 250, 0, h),
    ];
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
            width: String(size),
            height: String(size),
            viewBox: '0 0 ' + size + ' ' + size,
        });
        svg.appendChild(createSvgElement(CIRCLE, {
            'cx': String(ball.r),
            'cy': String(ball.r),
            'r': String(ball.r),
            'fill': ball.color,
        }));
        setStyle(svg, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            'pointer-events': 'none',
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
                left: this.x + 'px',
                top: this.y + 'px',
            });
        }
    }
}
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
class BoardSection extends UiElement {
    section;
    constructor(section, parent) {
        super(parent);
        this.section = section;
        this.setId(section.id);
        this.setPos(section.x, section.y);
        this.width = section.w;
        this.height = section.h;
    }
    build() {
        let section = this.section;
        let el = createElement(DIV);
        setStyle(el, {
            position: 'absolute',
            left: section.x + 'px',
            top: section.y + 'px',
            width: section.w + 'px',
            height: section.h + 'px',
            background: section.bg,
        });
        let svg = createSvgElement(SVG, {
            width: String(section.w),
            height: String(section.h),
            viewBox: '0 0 ' + section.w + ' ' + section.h,
        });
        setStyle(svg, {
            position: 'absolute',
            inset: '0',
        });
        for (let wall of section.walls) {
            svg.appendChild(createSvgElement(LINE, {
                x1: String(wall.a.x),
                y1: String(wall.a.y),
                x2: String(wall.b.x),
                y2: String(wall.b.y),
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
        for (let i = 0; i < section.widgets.length; i++) {
            let child = new WidgetElement(section.widgets[i]);
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
class ObstacleElement extends UiElement {
    obstacle;
    lineEls = [];
    constructor(obstacle, parent) {
        super(parent);
        this.obstacle = obstacle;
    }
    build() {
        let obstacle = this.obstacle;
        this.setPos(obstacle.x, obstacle.y);
        let svg = createSvgElement(SVG, {
            width: '1',
            height: '1',
        });
        setStyle(svg, {
            position: 'absolute',
            left: obstacle.x + 'px',
            top: obstacle.y + 'px',
            overflow: 'visible',
            'pointer-events': 'none',
        });
        for (let i = 0; i < obstacle.walls.length; i++) {
            let w = obstacle.walls[i];
            let lineEl = createSvgElement(LINE, {
                x1: String(w.a.x),
                y1: String(w.a.y),
                x2: String(w.b.x),
                y2: String(w.b.y),
                stroke: '#888',
                'stroke-width': '4',
                'stroke-linecap': 'round',
            });
            svg.appendChild(lineEl);
            this.lineEls.push(lineEl);
        }
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, svg);
        }
        this.el = svg;
    }
    render(_dt) {
        let stroke = this.obstacle.active ? '#fc8' : '#888';
        for (let i = 0; i < this.lineEls.length; i++) {
            setAttribute(this.lineEls[i], 'stroke', stroke);
        }
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
class WidgetElement extends UiElement {
    widget;
    lineEl = null;
    constructor(widget, parent) {
        super(parent);
        this.widget = widget;
    }
    build() {
        if (this.widget.type === WIDGET_PADDLE) {
            this.buildPaddle();
        }
        else if (this.widget.type === WIDGET_LAUNCHER) {
            this.buildLauncher();
        }
    }
    render(_dt) {
        if (this.widget.type === WIDGET_PADDLE) {
            this.renderPaddle();
        }
        else if (this.widget.type === WIDGET_LAUNCHER) {
            this.renderLauncher();
        }
    }
    buildPaddle() {
        let widget = this.widget;
        this.setPos(widget.x, widget.y);
        let svg = createSvgElement(SVG, {
            width: '1',
            height: '1',
        });
        setStyle(svg, {
            position: 'absolute',
            left: widget.x + 'px',
            top: widget.y + 'px',
            overflow: 'visible',
            'pointer-events': 'none',
        });
        let paddle = widget;
        let line = paddle.getLine();
        let lineEl = createSvgElement(LINE, {
            x1: '0',
            y1: '0',
            x2: String(line.b.x - line.a.x),
            y2: String(line.b.y - line.a.y),
            stroke: '#ccc',
            'stroke-width': '6',
            'stroke-linecap': 'round',
        });
        svg.appendChild(lineEl);
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, svg);
        }
        this.el = svg;
        this.lineEl = lineEl;
    }
    renderPaddle() {
        if (!this.lineEl) {
            return;
        }
        let paddle = this.widget;
        let line = paddle.getLine();
        let el = this.lineEl;
        setAttribute(el, 'x2', String(line.b.x - line.a.x));
        setAttribute(el, 'y2', String(line.b.y - line.a.y));
    }
    buildLauncher() {
        let launcher = this.widget;
        this.setPos(launcher.x, launcher.y);
        let svg = createSvgElement(SVG, {
            width: '1',
            height: '1',
        });
        setStyle(svg, {
            position: 'absolute',
            left: launcher.x + 'px',
            top: launcher.y + 'px',
            overflow: 'visible',
            'pointer-events': 'none',
        });
        let len = 24;
        let lineEl = createSvgElement(LINE, {
            x1: '0',
            y1: '0',
            x2: String(-launcher.dir.x * len),
            y2: String(-launcher.dir.y * len),
            stroke: '#c84',
            'stroke-width': '8',
            'stroke-linecap': 'round',
        });
        svg.appendChild(lineEl);
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, svg);
        }
        this.el = svg;
        this.lineEl = lineEl;
    }
    renderLauncher() {
        if (!this.lineEl) {
            return;
        }
        let el = this.lineEl;
        setAttribute(el, 'stroke', this.widget.active ? '#fc8' : '#c84');
    }
}
