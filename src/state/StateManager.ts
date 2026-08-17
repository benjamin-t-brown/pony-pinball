import { AbstractAction } from './AbstractAction';
import { createState, type State } from './State';

export type AsyncAction = {
  action: AbstractAction;
  timer: number;
};

export type ActionData = {
  sequentialActions: AsyncAction[];
  sequentialActionsNext: AsyncAction[];
  insertActions: AsyncAction[];
  parallelActions: AsyncAction[];
};

export class StateManager {
  state: State;
  actionData: ActionData;

  constructor(state?: State) {
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

  enqueueAction(actions: ActionData, action: AbstractAction, ms = 0) {
    actions.sequentialActionsNext.push(this.wrap(action, ms));
  }

  insertAction(actions: ActionData, action: AbstractAction, ms = 0) {
    actions.insertActions.push(this.wrap(action, ms));
  }

  pllAction(actions: ActionData, action: AbstractAction, ms = 0) {
    actions.parallelActions.push(this.wrap(action, ms));
  }

  moveSequentialActions(actions: ActionData) {
    for (const item of actions.sequentialActionsNext) {
      actions.sequentialActions.push(item);
    }
    actions.sequentialActionsNext.length = 0;
  }

  moveInsertActions(actions: ActionData) {
    const inserted = actions.insertActions;
    for (let i = inserted.length - 1; i >= 0; i--) {
      actions.sequentialActions.unshift(inserted[i]);
    }
    inserted.length = 0;
  }

  update(dt: number) {
    const actions = this.actionData;

    for (let i = actions.parallelActions.length - 1; i >= 0; i--) {
      const item = actions.parallelActions[i];
      item.timer -= dt;
      if (item.timer <= 0) {
        item.action.execute(this.state);
        actions.parallelActions.splice(i, 1);
      }
    }

    if (actions.sequentialActions.length) {
      const head = actions.sequentialActions[0];
      head.timer -= dt;
      if (head.timer <= 0) {
        actions.sequentialActions.shift();
        head.action.execute(this.state);
      }
    }

    this.moveInsertActions(actions);
    this.moveSequentialActions(actions);
  }

  wrap(action: AbstractAction, ms: number): AsyncAction {
    action.stateManager = this;
    return { action, timer: ms };
  }
}
