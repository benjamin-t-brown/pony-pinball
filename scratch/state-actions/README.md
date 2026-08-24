# StateManager / AbstractAction (parked)

Removed from the game zip — nothing enqueued actions. Restore later if you need delayed sequential / parallel work.

Wire-up that used to live in the game:

- `src/main.ts` created `new StateManager(state)`, then `StateManagerInterface.setStateManager(stateManager)`, and passed `stateManager` into `LayerManager`.
- `LayerManager.updateRender(dt)` called `this.stateManager.update(dt)` before rendering.
- Gameplay read state via `getStateGlobal()` on `StateManagerInterface` instead of `getState()` on `State.ts`.

```ts
stateManager.enqueueAction(stateManager.getActionData(), new SpawnBall(), 500);
```
