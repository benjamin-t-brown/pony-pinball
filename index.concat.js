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
let DT = 1000 / 60;
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
        while (this.acc >= DT) {
            this.integrate(DT);
            this.acc -= DT;
        }
        this.updateRender(dt);
        requestAnimationFrame(this.loop);
    };
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
                };
            };
            domAddEventListener(host, 'pointerdown', e => {
                let p = pos(e);
                this.onMouseDown(p.x, p.y, p.b);
            });
            domAddEventListener(host, 'pointerup', e => {
                let p = pos(e);
                this.onMouseUp(p.x, p.y, p.b);
            });
            domAddEventListener(host, 'pointermove', e => {
                let p = pos(e);
                this.onMouseHover(p.x, p.y);
            });
            domAddEventListener(host, 'wheel', e => {
                let p = pos(e);
                this.onMouseWheel(p.x, p.y, p.d);
            });
            addEventListener('keydown', e => {
                this.onKeyDown(e.code, e.keyCode);
            });
            addEventListener('keyup', e => {
                this.onKeyUp(e.code, e.keyCode);
            });
        }
    }
    onMouseDown(x, y, button) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseDownEvent(x, y, button)) {
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
    new LayerManager([new SimLayer(), new SimUiLayer(root)], stateManager).start();
};
addEventListener('load', startGame);
let ballCreate = (x = 0, y = 0) => {
    let b = circleCreate(x, y, BALL_R, 1);
    return { ...b, color: 'red' };
};
let ballIsOutOfBounds = (ball, w, h) => {
    return ball.pos.y > h + 40 || ball.pos.x < -40 || ball.pos.x > w + 40;
};
let W = 400;
let H = 600;
let BALL_R = 10;
let PADDLE_LEN = 58;
let PADDLE_SPEED = 14;
let PADDLE_RETURN = 10;
let MAX_BALL_SPEED = 900;
let LEFT_PIVOT = { x: 118, y: 520 };
let RIGHT_PIVOT = { x: 282, y: 520 };
let LEFT_REST = 0.45;
let LEFT_UP = -0.55;
let RIGHT_REST = Math.PI - 0.45;
let RIGHT_UP = Math.PI + 0.55;
let vecCreate = (x = 0, y = 0) => ({ x, y });
let vecAdd = (a, b) => vecCreate(a.x + b.x, a.y + b.y);
let vecSub = (a, b) => vecCreate(a.x - b.x, a.y - b.y);
let vecMul = (v, s) => vecCreate(v.x * s, v.y * s);
let vecDot = (a, b) => a.x * b.x + a.y * b.y;
let vecLen = (v) => Math.hypot(v.x, v.y);
let vecNorm = (v) => vecMul(v, 1 / (vecLen(v) || 1));
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
let lineCreate = (x1, y1, x2, y2) => ({
    a: vecCreate(x1, y1),
    b: vecCreate(x2, y2),
});
let lineSet = (l, x1, y1, x2, y2) => {
    l.a.x = x1;
    l.a.y = y1;
    l.b.x = x2;
    l.b.y = y2;
    return l;
};
let lineClosestPoint = (l, p) => {
    let ab = vecSub(l.b, l.a);
    let abLen2 = vecDot(ab, ab) || 1;
    let t = vecDot(vecSub(p, l.a), ab) / abLen2;
    t = Math.max(0, Math.min(1, t));
    return vecAdd(l.a, vecMul(ab, t));
};
let resolveCircleLine = (c, l, restitution = 0.75, surfaceVel) => {
    let cp = lineClosestPoint(l, c.pos);
    let diff = vecSub(c.pos, cp);
    let dist = vecLen(diff);
    if (dist >= c.r || dist === 0) {
        return false;
    }
    let n = vecNorm(diff);
    let penetration = c.r - dist;
    c.pos = vecAdd(c.pos, vecMul(n, penetration + 0.01));
    let relVel = surfaceVel ? vecSub(c.vel, surfaceVel) : c.vel;
    let vn = vecDot(relVel, n);
    if (vn < 0) {
        c.vel = vecSub(c.vel, vecMul(n, (1 + restitution) * vn));
        if (surfaceVel) {
            c.vel = vecAdd(c.vel, vecMul(surfaceVel, 0.35));
        }
    }
    return true;
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
        resolveCircleLine(ball, wall, 0.7);
    }
};
let updateSimulation = (state, dt) => {
    let dtSeconds = dt / 1000;
    for (let i = 0; i < state.balls.length; i++) {
        let ball = state.balls[i];
        updateBallMotion(ball, dtSeconds);
        resolveBallWalls(ball, state.walls);
        clampBallSpeed(ball);
        if (ballIsOutOfBounds(ball, state.width, state.height)) {
            state.balls[i] = ballCreate(230, 100);
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
let createState = () => ({
    balls: [ballCreate(130, 100)],
    walls: createWalls(W, H),
    input: { left: false, right: false },
    width: 400,
    height: 600,
});
let createWalls = (w, h) => {
    return [
        lineCreate(20, 20, 20, h - 20),
        lineCreate(w - 20, 20, w - 20, h - 20),
        lineCreate(20, 20, w - 20, 20),
        lineCreate(20, 140, 90, 280),
        lineCreate(w - 20, 140, w - 90, 280),
        lineCreate(90, 280, 130, 430),
        lineCreate(w - 90, 280, w - 130, 430),
        lineCreate(20, 470, 110, 510),
        lineCreate(w - 20, 470, w - 110, 510),
        lineCreate(150, 405, 250, 455),
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
        let host = this.parent && this.parent.el;
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
    el = null;
    svg = null;
    balls = [];
    constructor() {
        super();
        this.setId('board');
    }
    addBall(ball) {
        let el = new BallElement(ball);
        this.addChild(el);
        if (this.el) {
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
            if (!this.balls.some(el => el.ball === ball)) {
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
        if (child && child.el && this.el) {
            removeChild(this.el, child.el);
        }
        super.removeChildAtIndex(index);
    }
    build() {
        let state = getStateGlobal();
        this.width = state.width;
        this.height = state.height;
        let root = getGameRoot();
        if (!root) {
            return;
        }
        let el = createElement(DIV);
        setStyle(el, {
            position: 'relative',
            width: state.width + 'px',
            height: state.height + 'px',
            background: '#555',
        });
        appendChild(root, el);
        let svg = createSvgElement(SVG, {
            width: String(state.width),
            height: String(state.height),
            viewBox: '0 0 ' + state.width + ' ' + state.height,
        });
        setStyle(svg, {
            position: 'absolute',
            inset: '0',
        });
        appendChild(el, svg);
        for (let wall of state.walls) {
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
        this.el = el;
        this.svg = svg;
        this.syncBalls();
    }
    update(dt) {
        this.syncBalls();
        super.update(dt);
    }
    render(_dt) { }
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
    checkMouseDownEvent(mouseX, mouseY, button) {
        if (this.shouldPropagateEventsToChildren) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].checkMouseDownEvent(mouseX, mouseY, button)) {
                    return true;
                }
            }
        }
        if (!this.hit(mouseX, mouseY)) {
            return false;
        }
        this.isClicked = true;
        this.onMouseDown(mouseX, mouseY, button);
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
    onMouseDown(_x, _y, _button) { }
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
