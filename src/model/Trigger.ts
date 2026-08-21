import type { Section } from './Section';

export const TRIGGER_DEACTIVATE_WALL = 0;
export const TRIGGER_MOVE_DOOR = 1;

/**
 * Script attached to a trigger field. Occupancy is owned by the field; these
 * hooks may mutate the section (walls, parts) while the ball is inside.
 * `args` is the rest of the builder call after the trigger id.
 */
export class Trigger {
  args: number[] = [];

  constructor(args: number[]) {
    this.args = args;
  }

  onActivated(_section: Section) {}

  onDeactivated(_section: Section) {}

  onUpdate(_dt: number, _section: Section) {}
}

export class DeactivateWallTrigger extends Trigger {
  rest = 0.5;
  disableIn = -1;
  enableIn = -1;

  disableWall(section: Section) {
    const wall = section.walls[this.args[0]];
    if (!wall || wall.rest < 0) {
      return;
    }
    this.rest = wall.rest;
    wall.rest = -1;
  }

  enableWall(section: Section) {
    const wall = section.walls[this.args[0]];
    if (!wall) {
      return;
    }
    wall.rest = this.rest;
  }

  onActivated(section: Section) {
    this.enableIn = -1;
    if (this.args[1] > 0) {
      this.disableIn = this.args[1];
      return;
    }
    this.disableWall(section);
  }

  onDeactivated(section: Section) {
    this.disableIn = -1;
    if (this.args[2] > 0) {
      this.enableIn = this.args[2];
      return;
    }
    this.enableWall(section);
  }

  onUpdate(dt: number, section: Section) {
    if (this.disableIn >= 0) {
      this.disableIn -= dt;
      if (this.disableIn <= 0) {
        this.disableIn = -1;
        this.disableWall(section);
      }
    }
    if (this.enableIn >= 0) {
      this.enableIn -= dt;
      if (this.enableIn <= 0) {
        this.enableIn = -1;
        this.enableWall(section);
      }
    }
  }
}

export class MoveDoorTrigger extends Trigger {
  x0 = 0;
  y0 = 0;
  x1 = 0;
  y1 = 0;
  held = false;

  onActivated(section: Section) {
    const wall = section.walls[this.args[0]];
    if (!wall) {
      return;
    }
    this.held = true;
    this.x0 = wall.a.x;
    this.y0 = wall.a.y;
    this.x1 = wall.b.x;
    this.y1 = wall.b.y;
  }

  onDeactivated(section: Section) {
    this.held = false;
    const wall = section.walls[this.args[0]];
    if (!wall) {
      return;
    }
    wall.a.x = this.x0;
    wall.a.y = this.y0;
    wall.b.x = this.x1;
    wall.b.y = this.y1;
  }

  onUpdate(dt: number, section: Section) {
    if (!this.held) {
      return;
    }
    const s = dt / 1000;
    // wall.a.x += this.args[1] * s;
    // wall.a.y += this.args[2] * s;
    // wall.b.x += this.args[1] * s;
    // wall.b.y += this.args[2] * s;
  }
}

export const TRIGGERS: (typeof Trigger)[] = [];
TRIGGERS[TRIGGER_DEACTIVATE_WALL] = DeactivateWallTrigger;
TRIGGERS[TRIGGER_MOVE_DOOR] = MoveDoorTrigger;
