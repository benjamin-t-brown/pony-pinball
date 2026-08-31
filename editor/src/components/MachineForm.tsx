import type { CollectGoal, MachineMeta } from '@game/machine/MachineTypes';
import { sanitizeMachineId } from '@game/machine/MachineFormats';

type Props = {
  meta: MachineMeta;
  spawn: { x: number; y: number } | null;
  sectionCount: number;
  playing: boolean;
  onMeta: (meta: MachineMeta) => void;
  onSpawn: (spawn: { x: number; y: number }) => void;
};

const hex6 = (c: string) => {
  if (/^#[0-9a-fA-F]{3}$/.test(c)) {
    return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  }
  return c;
};

const SectionSelect = ({
  value,
  sectionCount,
  disabled,
  allowEmpty,
  emptyLabel,
  onChange,
}: {
  value: number;
  sectionCount: number;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  onChange: (value: number) => void;
}) => {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={e => {
        onChange(Number(e.target.value));
      }}
    >
      {allowEmpty ? <option value={-1}>{emptyLabel || '—'}</option> : null}
      {Array.from({ length: sectionCount }, (_, i) => (
        <option key={i} value={i}>
          {i}
        </option>
      ))}
    </select>
  );
};

export const MachineForm = ({
  meta,
  spawn,
  sectionCount,
  playing,
  onMeta,
  onSpawn,
}: Props) => {
  const patch = (next: Partial<MachineMeta>) => {
    onMeta({ ...meta, ...next });
  };

  const setGoal = (index: number, goal: CollectGoal) => {
    const collectGoals = meta.collectGoals.slice();
    collectGoals[index] = goal;
    patch({ collectGoals });
  };

  return (
    <details className="machine" open>
      <summary>Machine</summary>
      <div className="field">
        <label>name</label>
        <input
          type="text"
          value={meta.name}
          disabled={playing}
          onChange={e => {
            patch({ name: e.target.value });
          }}
        />
      </div>
      <div className="field">
        <label>id</label>
        <input
          type="text"
          value={meta.id}
          disabled={playing}
          onChange={e => {
            const id = e.target.value;
            const lastAuto = `${meta.id}:lt`;
            const bestAuto = `${meta.id}:bt`;
            patch({
              id,
              scoreKeys: {
                last:
                  meta.scoreKeys.last === lastAuto ? `${id}:lt` : meta.scoreKeys.last,
                best:
                  meta.scoreKeys.best === bestAuto
                    ? `${id}:bt`
                    : meta.scoreKeys.best,
              },
            });
          }}
          onBlur={() => {
            const id = sanitizeMachineId(meta.id);
            if (id === meta.id) {
              return;
            }
            const lastAuto = `${meta.id}:lt`;
            const bestAuto = `${meta.id}:bt`;
            patch({
              id,
              scoreKeys: {
                last:
                  meta.scoreKeys.last === lastAuto
                    ? `${id}:lt`
                    : meta.scoreKeys.last,
                best:
                  meta.scoreKeys.best === bestAuto
                    ? `${id}:bt`
                    : meta.scoreKeys.best,
              },
            });
          }}
        />
      </div>
      <div className="row fields-2">
        <div className="field">
          <label>spawn x</label>
          <input
            type="number"
            value={spawn ? Math.round(spawn.x) : 0}
            disabled={playing}
            onChange={e => {
              onSpawn({
                x: Number(e.target.value),
                y: spawn ? spawn.y : 0,
              });
            }}
          />
        </div>
        <div className="field">
          <label>spawn y</label>
          <input
            type="number"
            value={spawn ? Math.round(spawn.y) : 0}
            disabled={playing}
            onChange={e => {
              onSpawn({
                x: spawn ? spawn.x : 0,
                y: Number(e.target.value),
              });
            }}
          />
        </div>
      </div>
      <p className="hint-inline">Play-mode click also sets spawn.</p>
      <div className="field">
        <label>complete section</label>
        <SectionSelect
          value={meta.completeSection}
          sectionCount={sectionCount}
          disabled={playing || sectionCount === 0}
          onChange={completeSection => {
            patch({ completeSection });
          }}
        />
      </div>
      <div className="field">
        <label>menu tour</label>
        {meta.menuTour.map((id, i) => (
          <div className="row tour-row" key={`${id}-${i}`}>
            <SectionSelect
              value={id}
              sectionCount={sectionCount}
              disabled={playing}
              onChange={next => {
                const menuTour = meta.menuTour.slice();
                menuTour[i] = next;
                patch({ menuTour });
              }}
            />
            <button
              type="button"
              disabled={playing || i === 0}
              onClick={() => {
                const menuTour = meta.menuTour.slice();
                const tmp = menuTour[i - 1];
                menuTour[i - 1] = menuTour[i];
                menuTour[i] = tmp;
                patch({ menuTour });
              }}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={playing || i >= meta.menuTour.length - 1}
              onClick={() => {
                const menuTour = meta.menuTour.slice();
                const tmp = menuTour[i + 1];
                menuTour[i + 1] = menuTour[i];
                menuTour[i] = tmp;
                patch({ menuTour });
              }}
            >
              ↓
            </button>
            <button
              type="button"
              disabled={playing}
              onClick={() => {
                patch({
                  menuTour: meta.menuTour.filter((_, j) => j !== i),
                });
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div className="row">
          <SectionSelect
            value={-1}
            sectionCount={sectionCount}
            disabled={playing || sectionCount === 0}
            allowEmpty
            emptyLabel="Add stop…"
            onChange={id => {
              if (id < 0) {
                return;
              }
              patch({ menuTour: [...meta.menuTour, id] });
            }}
          />
        </div>
      </div>
      <div className="field">
        <label>tour ms / stop</label>
        <input
          type="number"
          min={500}
          step={500}
          value={meta.menuTourMs}
          disabled={playing}
          onChange={e => {
            patch({ menuTourMs: Math.max(0, Number(e.target.value) || 0) });
          }}
        />
      </div>
      <div className="field">
        <label>score key last</label>
        <input
          type="text"
          value={meta.scoreKeys.last}
          disabled={playing}
          onChange={e => {
            patch({ scoreKeys: { ...meta.scoreKeys, last: e.target.value } });
          }}
        />
      </div>
      <div className="field">
        <label>score key best</label>
        <input
          type="text"
          value={meta.scoreKeys.best}
          disabled={playing}
          onChange={e => {
            patch({ scoreKeys: { ...meta.scoreKeys, best: e.target.value } });
          }}
        />
      </div>
      <h3>Look</h3>
      <label className="check">
        <input
          type="checkbox"
          checked={meta.hud.flippers}
          disabled={playing}
          onChange={e => {
            patch({ hud: { ...meta.hud, flippers: e.target.checked } });
          }}
        />
        flipper buttons
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={meta.hud.launcher}
          disabled={playing}
          onChange={e => {
            patch({ hud: { ...meta.hud, launcher: e.target.checked } });
          }}
        />
        launcher button
      </label>
      <div className="field">
        <label>audio</label>
        <select
          value={meta.audio.bank}
          disabled={playing}
          onChange={e => {
            patch({
              audio: {
                bank: e.target.value === 'file' ? 'file' : 'zzfx',
              },
            });
          }}
        >
          <option value="zzfx">zzfx</option>
          <option value="file">mp3</option>
        </select>
      </div>
      <div className="field">
        <label>accent</label>
        <input
          type="color"
          value={hex6(meta.theme.accent)}
          disabled={playing}
          onChange={e => {
            patch({ theme: { ...meta.theme, accent: e.target.value } });
          }}
        />
      </div>
      <div className="row fields-2">
        <div className="field">
          <label>room</label>
          <input
            type="color"
            value={hex6(meta.theme.sectionBg)}
            disabled={playing}
            onChange={e => {
              patch({ theme: { ...meta.theme, sectionBg: e.target.value } });
            }}
          />
        </div>
        <div className="field">
          <label>dots</label>
          <input
            type="color"
            value={hex6(meta.theme.sectionDot)}
            disabled={playing}
            onChange={e => {
              patch({ theme: { ...meta.theme, sectionDot: e.target.value } });
            }}
          />
        </div>
      </div>
      <div className="field">
        <label>palette</label>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {meta.theme.palette.map((c, i) => (
            <input
              key={i}
              type="color"
              value={hex6(c)}
              disabled={playing}
              onChange={e => {
                const palette = meta.theme.palette.slice();
                palette[i] = e.target.value;
                patch({ theme: { ...meta.theme, palette } });
              }}
            />
          ))}
        </div>
      </div>
      <h3>Collect goals</h3>
      {meta.collectGoals.map((goal, i) => (
        <div className="goal-block" key={i}>
          <div className="row">
            <span className="status">Goal {i}</span>
            <button
              type="button"
              className="push-right"
              disabled={playing}
              onClick={() => {
                patch({
                  collectGoals: meta.collectGoals.filter((_, j) => j !== i),
                });
              }}
            >
              Remove
            </button>
          </div>
          <div className="row fields-2">
            <div className="field">
              <label>group</label>
              <input
                type="number"
                value={goal.group}
                disabled={playing}
                onChange={e => {
                  setGoal(i, { ...goal, group: Number(e.target.value) || 0 });
                }}
              />
            </div>
            <div className="field">
              <label>needed</label>
              <input
                type="number"
                min={1}
                value={goal.needed}
                disabled={playing}
                onChange={e => {
                  setGoal(i, {
                    ...goal,
                    needed: Math.max(1, Number(e.target.value) || 1),
                  });
                }}
              />
            </div>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={!!goal.disableWall}
              disabled={playing}
              onChange={e => {
                setGoal(i, {
                  ...goal,
                  disableWall: e.target.checked
                    ? { section: 0, wall: 0 }
                    : undefined,
                });
              }}
            />
            disable wall
          </label>
          {goal.disableWall ? (
            <div className="row fields-2">
              <div className="field">
                <label>section</label>
                <SectionSelect
                  value={goal.disableWall.section}
                  sectionCount={sectionCount}
                  disabled={playing}
                  onChange={section => {
                    setGoal(i, {
                      ...goal,
                      disableWall: { ...goal.disableWall!, section },
                    });
                  }}
                />
              </div>
              <div className="field">
                <label>wall id</label>
                <input
                  type="number"
                  min={0}
                  value={goal.disableWall.wall}
                  disabled={playing}
                  onChange={e => {
                    setGoal(i, {
                      ...goal,
                      disableWall: {
                        ...goal.disableWall!,
                        wall: Math.max(0, Number(e.target.value) || 0),
                      },
                    });
                  }}
                />
              </div>
            </div>
          ) : null}
          <label className="check">
            <input
              type="checkbox"
              checked={!!goal.activatePart}
              disabled={playing}
              onChange={e => {
                setGoal(i, {
                  ...goal,
                  activatePart: e.target.checked
                    ? { section: 0, part: 0 }
                    : undefined,
                });
              }}
            />
            activate light
          </label>
          {goal.activatePart ? (
            <div className="row fields-2">
              <div className="field">
                <label>section</label>
                <SectionSelect
                  value={goal.activatePart.section}
                  sectionCount={sectionCount}
                  disabled={playing}
                  onChange={section => {
                    setGoal(i, {
                      ...goal,
                      activatePart: { ...goal.activatePart!, section },
                    });
                  }}
                />
              </div>
              <div className="field">
                <label>part id</label>
                <input
                  type="number"
                  min={0}
                  value={goal.activatePart.part}
                  disabled={playing}
                  onChange={e => {
                    setGoal(i, {
                      ...goal,
                      activatePart: {
                        ...goal.activatePart!,
                        part: Math.max(0, Number(e.target.value) || 0),
                      },
                    });
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        disabled={playing}
        onClick={() => {
          patch({
            collectGoals: [
              ...meta.collectGoals,
              { group: 0, needed: 1 },
            ],
          });
        }}
      >
        Add collect goal
      </button>
    </details>
  );
};
