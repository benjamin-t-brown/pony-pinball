import { Collectable } from './parts/Collectable';
import { Decoration } from './parts/Decoration';
import { type Section, forEachPart } from './SectionFuncs';
import { type Ball } from './BallFuncs';
import { playSound, SOUND_GAME_WIN, SOUND_SECRET } from '../audio/SoundFuncs';
import type { CollectGoal } from '../machine/MachineTypes';
import { findPartById, findPartRef, findWallById, findWallRef } from '../machine/EntityIdFuncs';
import {
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_PLAY_SOUND,
} from '../machine/MachineCalls';

export {
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  TRIGGER_PLAY_SOUND,
};

/** @deprecated Collect goals live on the machine; kept so the editor schema still resolves. */
export const TRIGGER_GATE_SECTION_4 = 2;

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
    const wall = findWallById(section, this.args[0] | 0);
    if (!wall || wall.rest < 0) {
      return;
    }
    this.rest = wall.rest;
    wall.rest = -1;
  }

  enableWall(section: Section) {
    const wall = findWallById(section, this.args[0] | 0);
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

/**
 * Machine collect goal: after `needed` coins of `group`, disable a wall
 * and/or turn on a decoration.
 */
export class CollectGoalTrigger extends Trigger {
  goal: CollectGoal;

  constructor(goal: CollectGoal) {
    super([]);
    this.goal = goal;
  }

  onCollect(_section: Section, state: CollectState, groupType: number) {
    const goal = this.goal;
    if (groupType !== goal.group) {
      return;
    }
    if ((state.collected[goal.group] || 0) < goal.needed) {
      return;
    }
    const wallRef = goal.disableWall;
    if (wallRef) {
      const wall = findWallRef(state.sections, wallRef.section, wallRef.wall);
      if (wall && wall.rest !== -1) {
        wall.rest = -1;
        playSound(SOUND_SECRET);
      }
    }
    const partRef = goal.activatePart;
    if (partRef) {
      const light = findPartRef(state.sections, partRef.section, partRef.part);
      if (light instanceof Decoration) {
        light.activate();
      }
    }
  }
}

export const wireCollectGoals = (
  sections: Section[],
  goals: CollectGoal[]
) => {
  for (let i = 0; i < goals.length; i++) {
    const trigger = new CollectGoalTrigger(goals[i]);
    forEachPart(sections, part => {
      if (!(part instanceof Collectable)) {
        return;
      }
      const coin = part;
      if (coin.groupType === trigger.goal.group) {
        coin.trigger = trigger;
      }
    });
  }
};

export const resetCollectGoals = (
  sections: Section[],
  goals: CollectGoal[]
) => {
  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    const wallRef = goal.disableWall;
    if (wallRef) {
      const wall = findWallRef(sections, wallRef.section, wallRef.wall);
      if (wall && wall.rest < 0) {
        wall.rest = 0.5;
      }
    }
    const partRef = goal.activatePart;
    if (partRef) {
      const light = findPartRef(sections, partRef.section, partRef.part);
      if (light instanceof Decoration) {
        light.unactivate();
      }
    }
  }
};

export class ActivateLightTrigger extends Trigger {
  disableIn = -1;
  enableIn = -1;

  lightPart(section: Section) {
    const part = findPartById(section, this.args[0] | 0);
    if (!(part instanceof Decoration)) {
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
TRIGGERS[TRIGGER_ACTIVATE_LIGHT] = ActivateLightTrigger;
TRIGGERS[TRIGGER_PLAY_SOUND] = PlaySoundTrigger;
