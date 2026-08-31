import {
  World,
  Circle,
  Edge,
  Box,
  Settings,
  type Body,
  type Fixture,
} from 'planck';
import { GRAVITY, type Line } from './PhysicsFuncs';
import { PADDLE_FRICTION, PADDLE_HALF_WIDTH, PADDLE_REST } from '../model/Constants';
import { Obstacle } from '../model/parts/Obstacle';
import { Paddle } from '../model/parts/Paddle';
import type { Section } from '../model/SectionFuncs';
import type { Ball } from '../model/BallFuncs';
import { playSound } from '../audio/SoundFuncs';

/**
 * Box2D wants objects in the 0.1–10 m range. A 10px ball is 0.2 m here,
 * a 400×600 section is 8×12 m, and 950 px/s² gravity is ~19 m/s².
 */
export const M_PER_PX = 1 / 50;
export const PX_PER_M = 50;

const CAT_BALL = 0x0001;
const CAT_WALL = 0x0002;
const CAT_PADDLE = 0x0004;
const CAT_OBSTACLE = 0x0008;

const VEL_ITERS = 8;
const POS_ITERS = 3;

/** Below this relative speed Box2D treats a hit as inelastic. 0.2 m/s = 10 px/s. */
Settings.velocityThreshold = 0.2;

type FixData =
  | { kind: 'ball' }
  | { kind: 'wall'; line: Line }
  | { kind: 'paddle' }
  | { kind: 'obstacle'; obstacle: Obstacle };

type WallFix = {
  line: Line;
  fixture: Fixture;
  on: boolean;
};

type PaddleBody = {
  paddle: Paddle;
  body: Body;
  ox: number;
  oy: number;
};

type ObstacleBody = {
  obstacle: Obstacle;
  body: Body;
  ox: number;
  oy: number;
};

const m = (n: number) => n * M_PER_PX;

const px = (v: { x: number; y: number }) => ({
  x: v.x * PX_PER_M,
  y: v.y * PX_PER_M,
});

const setCollide = (fixture: Fixture, on: boolean) => {
  fixture.setFilterMaskBits(on ? CAT_BALL : 0);
};

const edgeLen2 = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
};

/**
 * Planck world for one machine. Game code still owns Ball pos/vel in pixels;
 * this is the solver. Kinematic paddles/obstacles are posed from Part.update
 * so flipper timing stays in game code.
 */
export class PhysicsWorld {
  world: World;
  wallFixes: WallFix[] = [];
  paddles: PaddleBody[] = [];
  obstacles: ObstacleBody[] = [];
  ballBodies: Body[] = [];

  constructor(sections: Section[]) {
    this.world = new World({ gravity: { x: 0, y: GRAVITY * M_PER_PX } });
    this.world.on('begin-contact', this.onBeginContact);
    this.buildStatics(sections);
    this.buildParts(sections);
  }

  private onBeginContact = (contact: {
    getFixtureA: () => Fixture;
    getFixtureB: () => Fixture;
  }) => {
    const a = contact.getFixtureA().getUserData() as FixData | undefined;
    const b = contact.getFixtureB().getUserData() as FixData | undefined;
    if (!a || !b) {
      return;
    }
    const wall = a.kind === 'wall' ? a : b.kind === 'wall' ? b : null;
    const obstacle =
      a.kind === 'obstacle' ? a : b.kind === 'obstacle' ? b : null;
    if (wall && wall.line.sound) {
      playSound(wall.line.sound);
    }
    if (obstacle) {
      obstacle.obstacle.onHit();
    }
  };

  private buildStatics(sections: Section[]) {
    const ground = this.world.createBody({ type: 'static' });
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      for (let j = 0; j < s.walls.length; j++) {
        const line = s.walls[j];
        if (edgeLen2(line.a, line.b) < 1e-8) {
          continue;
        }
        const on = line.rest >= 0;
        const fixture = ground.createFixture({
          shape: new Edge(
            { x: m(line.a.x + s.x), y: m(line.a.y + s.y) },
            { x: m(line.b.x + s.x), y: m(line.b.y + s.y) }
          ),
          friction: 0,
          restitution: Math.max(0, line.rest),
          filterCategoryBits: CAT_WALL,
          filterMaskBits: on ? CAT_BALL : 0,
          userData: { kind: 'wall', line } satisfies FixData,
        });
        this.wallFixes.push({ line, fixture, on });
      }
    }
  }

  private buildParts(sections: Section[]) {
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      for (let j = 0; j < s.parts.length; j++) {
        const part = s.parts[j];
        if (part instanceof Paddle) {
          this.addPaddle(part, s.x, s.y);
        } else if (part instanceof Obstacle) {
          this.addObstacle(part, s.x, s.y);
        }
      }
    }
  }

  private addPaddle(paddle: Paddle, ox: number, oy: number) {
    const len = paddle.len;
    if (len <= 0) {
      return;
    }
    const body = this.world.createKinematicBody({
      position: { x: m(paddle.x + ox), y: m(paddle.y + oy) },
      angle: paddle.angle,
    });
    body.createFixture({
      shape: new Box(
        m(len * 0.5),
        m(PADDLE_HALF_WIDTH),
        { x: m(len * 0.5), y: 0 }
      ),
      friction: PADDLE_FRICTION,
      restitution: PADDLE_REST,
      filterCategoryBits: CAT_PADDLE,
      filterMaskBits: CAT_BALL,
      userData: { kind: 'paddle' } satisfies FixData,
    });
    this.paddles.push({ paddle, body, ox, oy });
  }

  private addObstacle(obstacle: Obstacle, ox: number, oy: number) {
    const body = this.world.createKinematicBody({
      position: { x: m(obstacle.x + ox), y: m(obstacle.y + oy) },
      angle: obstacle.angle,
    });
    const rest = obstacle.walls[0] ? Math.max(0, obstacle.walls[0].rest) : 0.5;
    const data: FixData = { kind: 'obstacle', obstacle };
    if (obstacle.isCircle && obstacle.r > 0) {
      body.createFixture({
        shape: new Circle(m(obstacle.r)),
        friction: 0,
        restitution: rest,
        filterCategoryBits: CAT_OBSTACLE,
        filterMaskBits: CAT_BALL,
        userData: data,
      });
    } else {
      for (let i = 0; i < obstacle.walls.length; i++) {
        const w = obstacle.walls[i];
        if (edgeLen2(w.a, w.b) < 1e-8) {
          continue;
        }
        body.createFixture({
          shape: new Edge({ x: m(w.a.x), y: m(w.a.y) }, { x: m(w.b.x), y: m(w.b.y) }),
          friction: 0,
          restitution: Math.max(0, w.rest),
          filterCategoryBits: CAT_OBSTACLE,
          filterMaskBits: CAT_BALL,
          userData: data,
        });
      }
    }
    this.obstacles.push({ obstacle, body, ox, oy });
  }

  /** Gate walls toggle `rest < 0`; flip the fixture filter to match. */
  syncWalls() {
    for (let i = 0; i < this.wallFixes.length; i++) {
      const rec = this.wallFixes[i];
      const on = rec.line.rest >= 0;
      if (on === rec.on) {
        continue;
      }
      rec.on = on;
      setCollide(rec.fixture, on);
      if (on) {
        rec.fixture.setRestitution(rec.line.rest);
      }
    }
  }

  /**
   * Pose kinematics from the just-updated parts. Paddles start the step at
   * `prevAngle` with `omega` so the solver sees the sweep, then snap after step.
   */
  syncKinematics() {
    for (let i = 0; i < this.paddles.length; i++) {
      const rec = this.paddles[i];
      const p = rec.paddle;
      rec.body.setTransform(
        { x: m(p.x + rec.ox), y: m(p.y + rec.oy) },
        p.prevAngle
      );
      rec.body.setLinearVelocity({ x: 0, y: 0 });
      rec.body.setAngularVelocity(p.omega);
    }
    for (let i = 0; i < this.obstacles.length; i++) {
      const rec = this.obstacles[i];
      const o = rec.obstacle;
      const live = o.active || o.alwaysSolid;
      if (rec.body.isActive() !== live) {
        rec.body.setActive(live);
      }
      if (!live) {
        continue;
      }
      rec.body.setTransform(
        { x: m(o.x + rec.ox), y: m(o.y + rec.oy) },
        o.angle
      );
      rec.body.setLinearVelocity({ x: m(o.vx), y: m(o.vy) });
      rec.body.setAngularVelocity(o.omega);
    }
  }

  /** Undo kinematic integration so Part.update stays the pose source. */
  snapKinematics() {
    for (let i = 0; i < this.paddles.length; i++) {
      const rec = this.paddles[i];
      const p = rec.paddle;
      rec.body.setTransform(
        { x: m(p.x + rec.ox), y: m(p.y + rec.oy) },
        p.angle
      );
      rec.body.setLinearVelocity({ x: 0, y: 0 });
      rec.body.setAngularVelocity(0);
    }
    for (let i = 0; i < this.obstacles.length; i++) {
      const rec = this.obstacles[i];
      const o = rec.obstacle;
      rec.body.setTransform(
        { x: m(o.x + rec.ox), y: m(o.y + rec.oy) },
        o.angle
      );
      rec.body.setLinearVelocity({ x: 0, y: 0 });
      rec.body.setAngularVelocity(0);
    }
  }

  private makeBallBody(ball: Ball): Body {
    const body = this.world.createDynamicBody({
      position: { x: m(ball.pos.x), y: m(ball.pos.y) },
      bullet: true,
      fixedRotation: true,
      allowSleep: false,
      awake: true,
      userData: { kind: 'ball' },
    });
    body.createFixture({
      shape: new Circle(m(ball.r)),
      density: 1,
      friction: 0.15,
      restitution: 0,
      filterCategoryBits: CAT_BALL,
      filterMaskBits: CAT_WALL | CAT_PADDLE | CAT_OBSTACLE,
      userData: { kind: 'ball' } satisfies FixData,
    });
    return body;
  }

  /**
   * Keep one dynamic body per Ball. Ball is written into the body before the
   * step (velocity + teleports); after the step the body is the source of truth.
   */
  syncBalls(balls: Ball[], gravity: number[]) {
    while (this.ballBodies.length > balls.length) {
      const body = this.ballBodies.pop();
      if (body) {
        this.world.destroyBody(body);
      }
    }
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      let body = this.ballBodies[i];
      if (!body) {
        body = this.makeBallBody(ball);
        this.ballBodies[i] = body;
      }
      if (ball.warpMs > 0) {
        if (body.isActive()) {
          body.setActive(false);
        }
        continue;
      }
      if (!body.isActive()) {
        body.setActive(true);
      }
      const pos = body.getPosition();
      const dx = ball.pos.x - pos.x * PX_PER_M;
      const dy = ball.pos.y - pos.y * PX_PER_M;
      if (dx * dx + dy * dy > 0.25) {
        body.setTransform({ x: m(ball.pos.x), y: m(ball.pos.y) }, 0);
      }
      body.setLinearVelocity({ x: m(ball.vel.x), y: m(ball.vel.y) });
      const g = gravity[i] == null ? GRAVITY : gravity[i];
      body.setGravityScale(g / GRAVITY);
      body.setAwake(true);
    }
  }

  writeBalls(balls: Ball[]) {
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      if (ball.warpMs > 0) {
        continue;
      }
      const body = this.ballBodies[i];
      if (!body || !body.isActive()) {
        continue;
      }
      const pos = px(body.getPosition());
      const vel = px(body.getLinearVelocity());
      ball.pos.x = pos.x;
      ball.pos.y = pos.y;
      ball.vel.x = vel.x;
      ball.vel.y = vel.y;
    }
  }

  /** After a speed clamp or launcher, push velocity back without moving the body. */
  applyBallVel(i: number, ball: Ball) {
    const body = this.ballBodies[i];
    if (!body || ball.warpMs > 0) {
      return;
    }
    body.setLinearVelocity({ x: m(ball.vel.x), y: m(ball.vel.y) });
  }

  teleportBall(i: number, ball: Ball) {
    const body = this.ballBodies[i];
    if (!body) {
      this.ballBodies[i] = this.makeBallBody(ball);
      return;
    }
    if (!body.isActive()) {
      body.setActive(true);
    }
    body.setTransform({ x: m(ball.pos.x), y: m(ball.pos.y) }, 0);
    body.setLinearVelocity({ x: m(ball.vel.x), y: m(ball.vel.y) });
    body.setAwake(true);
  }

  step(dtSeconds: number) {
    this.world.step(dtSeconds, VEL_ITERS, POS_ITERS);
  }
}

export const createPhysics = (sections: Section[]) => new PhysicsWorld(sections);
