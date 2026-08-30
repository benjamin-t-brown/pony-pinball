import { PART_DECORATION } from './Part';
import type { Section } from './Section';
import { type Ball } from './Ball';
import { playSound, SOUND_GAME_WIN, SOUND_SECRET } from '../zzfx.js';

export const TRIGGER_DEACTIVATE_WALL = 0;
/** Collectable: 5 coins of group 0 open all gates in section 4. */
export const TRIGGER_GATE_SECTION_4 = 2;
/** Field: turn a decoration light on while occupied, off when left. */
export const TRIGGER_ACTIVATE_LIGHT = 3;
/** Field: play a zzfx sound when the ball enters. */
export const TRIGGER_PLAY_SOUND = 5;

export type CollectState = {
  collected: number[];
  sections: Section[];
};

/**
 * Script attached to a trigger field or collectable. Occupancy / pickup is
 * owned by the part; these hooks may mutate the section (walls, parts).
 * `args` is the rest of the builder call after the trigger id.
 */
export class Trigger {
  args: number[] = [];

  constructor(args: number[]) {
    this.args = args;
  }

  onActivated(_section: Section, _ball?: Ball) {}

  onDeactivated(_section: Section) {}

  onUpdate(_dt: number, _section: Section) {}

  onCollect(_section: Section, _state: CollectState, _groupType: number) {}
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

const GATE4_SECTION = 4;
const GATE4_WALL = 31;
const GATE4_LIGHT = 21;
const GATE4_NEEDED = 6;

/**
 * Hardcoded collectable goal: after 6 group-0 coins, disable a wall and
 * turn on a light in section 4.
 */
export class GateSection4Trigger extends Trigger {
  onCollect(_section: Section, state: CollectState, groupType: number) {
    if (groupType !== 0) {
      return;
    }
    if ((state.collected[0] || 0) < GATE4_NEEDED) {
      return;
    }
    const target = state.sections[GATE4_SECTION];
    if (!target) {
      return;
    }
    if (target.walls[GATE4_WALL].rest !== -1) {
      target.walls[GATE4_WALL].rest = -1;
      playSound(SOUND_SECRET);
    }
    const light = target.parts[GATE4_LIGHT];
    if (light && light.type === PART_DECORATION) {
      light.activate();
    }
  }
}

export const resetGateSection4 = (sections: Section[]) => {
  const target = sections[GATE4_SECTION];
  if (!target) {
    return;
  }
  const wall = target.walls[GATE4_WALL];
  if (wall && wall.rest < 0) {
    wall.rest = 0.5;
  }
  const light = target.parts[GATE4_LIGHT];
  if (light && light.type === PART_DECORATION) {
    light.unactivate();
  }
};

export class ActivateLightTrigger extends Trigger {
  disableIn = -1;
  enableIn = -1;

  lightPart(section: Section) {
    const part = section.parts[this.args[0]];
    if (!part || part.type !== PART_DECORATION) {
      return null;
    }
    return part;
  }

  enableLight(section: Section) {
    const part = this.lightPart(section);
    if (part) {
      part.activate();
    }
  }

  disableLight(section: Section) {
    const part = this.lightPart(section);
    if (part) {
      part.unactivate();
    }
  }

  onActivated(section: Section) {
    this.disableIn = -1;
    if (this.args[1] > 0) {
      this.enableIn = this.args[1];
      return;
    }
    this.enableLight(section);
  }

  onDeactivated(section: Section) {
    this.enableIn = -1;
    if (this.args[2] > 0) {
      this.disableIn = this.args[2];
      return;
    }
    this.disableLight(section);
  }

  onUpdate(dt: number, section: Section) {
    if (this.enableIn >= 0) {
      this.enableIn -= dt;
      if (this.enableIn <= 0) {
        this.enableIn = -1;
        this.enableLight(section);
      }
    }
    if (this.disableIn >= 0) {
      this.disableIn -= dt;
      if (this.disableIn <= 0) {
        this.disableIn = -1;
        this.disableLight(section);
      }
    }
  }
}

export class PlaySoundTrigger extends Trigger {
  onActivated() {
    const id = this.args[0] | 0;
    if (id < 0 || id > SOUND_GAME_WIN) {
      return;
    }
    playSound(id);
  }
}

export const TRIGGERS: (typeof Trigger)[] = [];
TRIGGERS[TRIGGER_DEACTIVATE_WALL] = DeactivateWallTrigger;
TRIGGERS[TRIGGER_GATE_SECTION_4] = GateSection4Trigger;
TRIGGERS[TRIGGER_ACTIVATE_LIGHT] = ActivateLightTrigger;
TRIGGERS[TRIGGER_PLAY_SOUND] = PlaySoundTrigger;
