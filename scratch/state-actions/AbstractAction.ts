import type { State } from '../../src/state/State';
import type { StateManager } from './StateManager';

export abstract class AbstractAction {
  state: State | null = null;
  stateManager: StateManager | null = null;

  act() {}

  getName() {
    return this.constructor.name;
  }

  setState(state: State) {
    this.state = state;
  }

  execute(state: State) {
    this.state = state;
    this.act();
  }

  insertAction(action: AbstractAction, ms = 0) {
    if (!this.stateManager) {
      return;
    }
    this.stateManager.insertAction(
      this.stateManager.getActionData(),
      action,
      ms
    );
  }

  enqueueAction(action: AbstractAction, ms = 0) {
    if (!this.stateManager) {
      return;
    }
    this.stateManager.enqueueAction(
      this.stateManager.getActionData(),
      action,
      ms
    );
  }
}
