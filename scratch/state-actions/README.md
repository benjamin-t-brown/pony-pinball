# StateManager / AbstractAction (parked)

Removed from the game zip to save bytes — nothing enqueued actions. Restore
later if you need delayed sequential / parallel work.

The 13k zip budget is lifted (see repo README). This is a candidate to bring
back as a machine-data sequencer (delays, parallel beats, table-specific
goals) rather than as a second global singleton next to `State.ts`. Do not
key actions off `constructor.name`; that was unsafe under Terser mangling and
is still a bad editor contract. Use stable ids in the machine file.

Wire-up that used to live in the game:

- `src/Main.ts` created `new StateManager(state)`, then `StateManagerInterface.setStateManager(stateManager)`, and passed `stateManager` into `LayerManager`.
- `LayerManager.updateRender(dt)` called `this.stateManager.update(dt)` before rendering.
- Gameplay read state via `getStateGlobal()` on `StateManagerInterface` instead of `getState()` on `State.ts`.

```ts
stateManager.enqueueAction(stateManager.getActionData(), new SpawnBall(), 500);
```
