import { StateManager } from './StateManager';

export class StateManagerInterface {
  static stateManager: StateManager | null = null;
  static getStateManager(throwIfNotSet = false): StateManager {
    if (throwIfNotSet && !this.stateManager) {
      throw new Error('StateManager not set');
    }
    return this.stateManager;
  }
  static hasStateManager(): boolean {
    return this.stateManager !== null;
  }
  static setStateManager(stateManager: StateManager): void {
    this.stateManager = stateManager;
  }
}

export const getStateGlobal = () => {
  return StateManagerInterface.getStateManager(true).getState();
};
