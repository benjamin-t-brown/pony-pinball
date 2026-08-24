export const W = 400;
export const H = 600;
export const BALL_R = 10;
export const PADDLE_LEN = 58;
export const PADDLE_SPEED = 18;
export const PADDLE_RETURN = 10;
// Matches the rendered stroke, so the ball rides on the paddle's face rather
// than sinking to its centre line.
export const PADDLE_HALF_WIDTH = 3;
export const PADDLE_REST = 0.35;
export const PADDLE_FRICTION = 0.25;
// A tip hit adds PADDLE_SPEED * PADDLE_LEN of surface speed on top of whatever
// the ball arrived with, so the cap has to clear that or the kick gets shaved.
export const MAX_BALL_SPEED = 1500;
export const PORTAL_WARP_MS = 300;
export const LAUNCHER_X = 384;
export const LAUNCHER_Y = 582;
export const LAUNCHER_FORCE = 1250;
export const LAUNCHER_RANGE = 36;
export const LAUNCHER_CHARGE_MS = 600;
export const LAUNCHER_LEN = 24;

/** Gate wall and decoration texture colors. */
export const GATE_COLORS = ['#fc8', '#8cf', '#f66', '#6c6', '#c8f', '#fa6'];

export const LEFT_PIVOT = { x: 118, y: 450 };
export const RIGHT_PIVOT = { x: 282, y: 450 };
export const LEFT_REST_ANGLE = 0.45;
export const LEFT_UP = -0.55;
export const RIGHT_REST_ANGLE = Math.PI - 0.45;
export const RIGHT_UP = Math.PI + 0.55;
