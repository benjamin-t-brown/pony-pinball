# pony-pinball

A pinball / pachinko **engine** plus a level editor. The runtime is shared; a table is a `Machine`. The current table is the old js13k pony board, now running on Planck.js instead of a custom circle/line solver. The 13k size budget is lifted.

The product goal is: **author tables in the editor, package each as a self-contained game** (engine + one machine, no editor).

## Run

```bash
npm start          # game (Vite, port 7832); plays src/tables/Current.ts
npm run editor     # editor (Vite, port 7833); load/save src/tables/<Id>.ts
npm run build      # typecheck + Vite production build of the current machine
npm run dist       # serve dist/

# pin a table for play or export (overrides Current.ts)
MACHINE=pony npm start
npm run build --machine=pony
```

On PowerShell: `$env:MACHINE="pony"; npm start`

## Layout

| Path | What |
| --- | --- |
| `src/` | Game runtime. `Main.ts` is the page entry (lib2 shell + layers). File names are PascalCase (see `.cursor/rules/src-file-names.mdc`). |
| `src/tables/` | One generated file per table (`Pony.ts`, …). `Current.ts` re-exports the table last saved in the editor. |
| `src/machine/` | `Machine` types (`MachineTypes.ts`) and converters (`MachineFormats.ts`). `createState(machine)` is the packaging seam. |
| `src/sim/` | `PhysicsWorld.ts` (Planck), `SimUpdate.ts` (tick), `PhysicsFuncs.ts` (Vec/Line helpers). |
| `editor/` | React editor. Imports `@game` → `src/`. Never the other way around. |
| `scripts/` | `copy-lib2` refreshes the vendored arcade shell. |
| `scratch/` | Design notes and parked experiments. |

## How it is wired

```
Machine  →  createState  →  State (sections, Ball, PhysicsWorld)
                │
                ├─ 4 ms update: Part.update → overlap (fields/portals/coins)
                │              → PhysicsWorld sync → world.step → copy ball back
                │              → launcher / clamp
                └─ 1× / frame render: Board camera + BallElement / PartElement (CSS/SVG)
```

**Machine.** Each `src/tables/<Id>.ts` (PascalCase of the id, e.g. `pony` → `Pony.ts`) exports `machine`: id, name, spawn, complete section, menu tour, score keys, collect goals, theme, hud, audio, sections, links. Section `calls` are named objects (`{ kind: B_FIELD, x, y, w, h, trigger: TRIGGER_DEACTIVATE_WALL, wall, id }`, …). `kind` is a numeric `B_*` constant (same ids as the editor palette). Field `trigger` is a numeric `TRIGGER_*` constant. Decoration style is a numeric `DEC_*` constant. Shared part keys live on `PartProps` (`id`, `opacity`). Each part kind is a `Part` subclass plus a view under `src/ui/parts/`; `createPartElement` picks the view. The editor round-trips through Vite middleware (`editor/vite-plugin-machines.ts`): list / load / save / create by id. Saving a table also rewrites `Current.ts` so `npm start` plays it.

A production build inlines **one** machine. Default is whatever `Current.ts` points at. `MACHINE=<id>` (or `npm run build --machine=<id>`) points Vite at that file instead.

**Sim.** Planck (Box2D) owns collisions. Scale is 50 px = 1 m. Walls, the ball, kinematic flippers, and bumpers/fans are fixtures. Fields, portals, collectables, and the launcher stay as overlap on the pixel `Ball`; they write velocity / gravity scale / warp, then the world steps. Flipper angle still comes from `Paddle.update`; the world is posed from that, then snapped back so Planck is not the motor.

The loop is a **fixed 4 ms** accumulator (`LayerManager`). Display is once per animation frame. Physics dt does not track refresh rate; flipper *input* still can.

**View.** DOM/SVG (`Board` → rooms → parts). The view holds references to `Ball` / `Part` and paints in `render()`. Moving things (ball, spinning obstacles) use CSS `transform`; rooms and static parts use `left`/`top` once. Planck never talks to the DOM.

**Editor.** Play mode calls the same `updateSimulation` / `createState`. One-way: `editor/` → `src/`.

## Direction

- **Engine vs machine.** Physics, parts, camera, UI shell stay shared. Geometry, goals, theme, and win conditions belong on the machine.
- **Many tables, one editor.** Load / save / export by machine id.
- **Self-contained exports.** One HTML bundle per table, via Vite.
- **Pinball and pachinko.** Same section / wall / part / field blocks; different defaults and goals.

Keep from the 13k era: prefabs expand at runtime, the editor previews the real sim, openings are explicit links. Drop anything that exists only to save bytes.

## Still to do

Rough order: **engine hygiene**. Packaging (catalog + Vite one-machine export) is in. Section calls are named objects (`kind`, `id`, `opacity`, …).

- **Perimeter.** At most one opening per edge today. Multiple holes per edge is a real table feature.
- **`getState()`.** The game still has a module singleton. `createState(machine)` already builds any table.

Flipper *feel* vs the old surface-frame solver needs playtesting, not a second physics engine.

## What to keep

- Sections as nodes, openings as edges (free placement, snap-to-edge).
- Editor uses real `updateSimulation` — no second physics.
- Prefabs expand at play time — data stays a call, not baked geometry.
- Editor validation (opening width, links, unreachable rooms).
- Planck as the solver. Do not go back to a custom circle/line shim.

Design notes that still hold: `scratch/EDITOR_NOTES.txt` (sections, links, prefabs). Parked sequenced actions: `scratch/state-actions/`.
