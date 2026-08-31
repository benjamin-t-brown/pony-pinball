import {
  decorationFromId,
  decorationStyleId,
  fieldTriggerId,
  isPartKind,
  kindToBuilderId,
  triggerFromId,
  type MachineCall,
  wallSegAt,
} from '@game/machine/MachineCalls';
import { partIdOf, setPartId } from '@game/machine/EntityIdFuncs';
import {
  B_DECORATION,
  B_FIELD,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
} from '@game/model/Builders';
import { palette } from '@game/machine/MachineLook';
import { DEC_ICON, DEC_RAINBOW, TEX_PALETTE } from '@game/model/parts/Decoration';
import type { Opening, SectionData, Selection } from '../types';
import {
  DECORATION_DEFS,
  SHAPE_DEFS,
  CIRCLE_ICON_DEFS,
  decorationDefFor,
  decArgDefault,
  defFor,
  TRIGGER_DEFS,
  SOUND_DEFS,
  triggerArgDefault,
  triggerDefFor,
} from '../schema';
import { cloneSections, roundAngle } from '../geometry';
import { openingsToLinks } from '../openings';
import { convertWallKind } from '../wallRefs';

type Props = {
  sections: SectionData[];
  openings: Opening[];
  selection: Selection;
  onChange: (sections: SectionData[]) => void;
  onSelection: (selection: Selection) => void;
};

const WALL_KINDS = [
  { id: B_WALLS, label: 'Walls' },
  { id: B_WALL_RESTI, label: 'Wall resti' },
  { id: B_WALL_GATE, label: 'Wall gate' },
];

const num = (v: unknown, fallback = 0) => {
  return typeof v === 'number' ? v : fallback;
};

export const BuilderForm = ({
  sections,
  openings,
  selection,
  onChange,
  onSelection,
}: Props) => {
  const GATE_COLORS = palette();
  if (!selection || (selection.kind !== 'call' && selection.kind !== 'wall')) {
    return null;
  }

  const section = sections[selection.section];
  if (!section) {
    return null;
  }
  const call = section[4][selection.call];
  if (!call) {
    return null;
  }

  const patchCall = (fn: (nextCall: MachineCall) => void) => {
    const next = cloneSections(sections);
    fn(next[selection.section][4][selection.call]);
    onChange(next);
  };

  const setKey = (key: string, value: number | boolean | string, round = false) => {
    patchCall(nextCall => {
      let v: number | boolean | string = value;
      if (typeof value === 'number' && round) {
        v = Math.round(value);
      }
      (nextCall as unknown as Record<string, number | boolean | string>)[key] = v;
    });
  };

  if (selection.kind === 'wall') {
    const seg = wallSegAt(call, selection.segment);
    const title =
      call.kind === B_WALL_RESTI
        ? 'Wall resti'
        : call.kind === B_WALL_GATE
          ? 'Wall gate'
          : 'Wall segment';
    const convertTo = (kind: number) => {
      const result = convertWallKind(
        sections,
        selection,
        kind,
        openingsToLinks(sections, openings)
      );
      onChange(result.sections);
      onSelection(result.selection);
    };
    return (
      <div>
        <h2>{title}</h2>
        {(['x0', 'y0', 'x1', 'y1'] as const).map(name => (
          <div className="field" key={name}>
            <label>{name}</label>
            <input
              type="number"
              value={seg ? seg[name] : 0}
              onChange={e => {
                const v = Math.round(Number(e.target.value));
                patchCall(nextCall => {
                  const s = wallSegAt(nextCall, selection.segment);
                  if (s) {
                    s[name] = v;
                    if (nextCall.kind === B_WALL_RESTI || nextCall.kind === B_WALL_GATE) {
                      nextCall[name] = v;
                    }
                  }
                });
              }}
            />
          </div>
        ))}
        {call.kind === B_WALL_RESTI ? (
          <div className="field">
            <label>restitution</label>
            <input
              type="number"
              step={0.05}
              value={call.rest ?? 0.5}
              onChange={e => {
                setKey('rest', Number(e.target.value));
              }}
            />
          </div>
        ) : null}
        {call.kind === B_WALL_GATE ? (
          <div className="field">
            <label>color</label>
            <select
              value={call.color ?? 0}
              onChange={e => {
                setKey('color', Number(e.target.value), true);
              }}
            >
              {GATE_COLORS.map((c, i) => (
                <option key={c} value={i}>
                  {i}: {c}
                </option>
              ))}
            </select>
            <span
              style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                marginLeft: 8,
                verticalAlign: 'middle',
                background: GATE_COLORS[(call.color ?? 0) % GATE_COLORS.length],
                border: '1px solid #000',
              }}
            />
          </div>
        ) : null}
        <p className="status">Convert to</p>
        <div className="row">
          {WALL_KINDS.map(kind => (
            <button
              key={kind.id}
              type="button"
              disabled={kindToBuilderId(call.kind) === kind.id}
              onClick={() => {
                convertTo(kind.id);
              }}
            >
              {kind.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const def = defFor(kindToBuilderId(call.kind));
  const hasTrigger = call.kind === B_FIELD;
  const trig = hasTrigger
    ? triggerDefFor(fieldTriggerId(call.trigger))
    : null;
  const hasDecoration = call.kind === B_DECORATION;
  const dec = hasDecoration
    ? decorationDefFor(decorationStyleId(call.decoration))
    : null;
  const params = def ? def.params : [];
  const extra = trig
    ? trig.args.map(name => ({ name }))
    : dec
      ? dec.args.map(name => ({ name }))
      : [];
  const rec = call as unknown as Record<string, number | boolean | string | undefined>;

  return (
    <div>
      <h2>{def ? def.name : call.kind}</h2>
      {[...params, ...extra].map((param: { name: string; step?: number }) =>
        param.name === 'texture' &&
        call.kind === B_DECORATION &&
        call.decoration === DEC_RAINBOW ? null : (
          <div className="field" key={param.name}>
            <label>
              {param.name === 'wall'
                ? 'wall id'
                : param.name === 'part'
                  ? 'part id'
                  : param.name}
            </label>
            {param.name === 'trigger' ? (
              <select
                value={fieldTriggerId(call.kind === B_FIELD ? call.trigger : undefined)}
                onChange={e => {
                  const id = Number(e.target.value);
                  patchCall(nextCall => {
                    if (nextCall.kind !== B_FIELD) {
                      return;
                    }
                    const savedId = partIdOf(nextCall);
                    nextCall.trigger = triggerFromId(id);
                    delete nextCall.wall;
                    delete nextCall.part;
                    delete nextCall.sound;
                    delete nextCall.onDelay;
                    delete nextCall.offDelay;
                    const names = triggerDefFor(id).args;
                    for (let i = 0; i < names.length; i++) {
                      (nextCall as unknown as Record<string, number>)[names[i]] =
                        triggerArgDefault(names[i], nextCall);
                    }
                    if (savedId) {
                      setPartId(nextCall, savedId);
                    }
                  });
                }}
              >
                {TRIGGER_DEFS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'decoration' ? (
              <select
                value={decorationStyleId(
                  call.kind === B_DECORATION ? call.decoration : undefined
                )}
                onChange={e => {
                  const id = Number(e.target.value);
                  patchCall(nextCall => {
                    if (nextCall.kind !== B_DECORATION) {
                      return;
                    }
                    nextCall.decoration = decorationFromId(id);
                    if (id === DEC_ICON && nextCall.texture === TEX_PALETTE) {
                      nextCall.texture = 0;
                    }
                    delete nextCall.shape;
                    delete nextCall.startOn;
                    delete nextCall.interval;
                    delete nextCall.count;
                    delete nextCall.x1;
                    delete nextCall.y1;
                    delete nextCall.delay;
                    delete nextCall.w;
                    delete nextCall.h;
                    if (id !== DEC_ICON) {
                      delete nextCall.opacity;
                    }
                    const names = decorationDefFor(id).args;
                    for (let i = 0; i < names.length; i++) {
                      if (names[i] === 'opacity') {
                        nextCall.opacity = decArgDefault(names[i], nextCall);
                        continue;
                      }
                      (nextCall as unknown as Record<string, number>)[names[i]] =
                        decArgDefault(names[i], nextCall);
                    }
                  });
                }}
              >
                {DECORATION_DEFS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'texture' ? (
              <>
                <select
                  value={num(rec.texture)}
                  onChange={e => {
                    setKey('texture', Number(e.target.value), true);
                  }}
                >
                  {GATE_COLORS.map((c, ti) => (
                    <option key={c} value={ti}>
                      {ti}: {c}
                    </option>
                  ))}
                  {!(call.kind === B_DECORATION && call.decoration === DEC_ICON) ? (
                    <option value={TEX_PALETTE}>all: palette</option>
                  ) : null}
                </select>
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    marginLeft: 8,
                    verticalAlign: 'middle',
                    background:
                      num(rec.texture) === TEX_PALETTE
                        ? 'linear-gradient(90deg,' + GATE_COLORS.join(',') + ')'
                        : GATE_COLORS[num(rec.texture) % GATE_COLORS.length],
                    border: '1px solid #000',
                  }}
                />
              </>
            ) : param.name === 'shape' ? (
              <select
                value={num(rec.shape)}
                onChange={e => {
                  setKey('shape', Number(e.target.value), true);
                }}
              >
                {SHAPE_DEFS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'color' ? (
              <>
                <select
                  value={num(rec.color)}
                  onChange={e => {
                    setKey('color', Number(e.target.value), true);
                  }}
                >
                  {GATE_COLORS.map((c, ci) => (
                    <option key={c} value={ci}>
                      {ci}: {c}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    marginLeft: 8,
                    verticalAlign: 'middle',
                    background:
                      GATE_COLORS[num(rec.color) % GATE_COLORS.length],
                    border: '1px solid #000',
                  }}
                />
              </>
            ) : param.name === 'icon' ? (
              <select
                value={num(rec.icon)}
                onChange={e => {
                  setKey('icon', Number(e.target.value), true);
                }}
              >
                {CIRCLE_ICON_DEFS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'startOn' ? (
              <select
                value={num(rec.startOn, 1)}
                onChange={e => {
                  setKey('startOn', Number(e.target.value), true);
                }}
              >
                <option value={1}>on</option>
                <option value={0}>off</option>
              </select>
            ) : param.name === 'sound' ? (
              <select
                value={num(rec.sound)}
                onChange={e => {
                  setKey('sound', Number(e.target.value), true);
                }}
              >
                {SOUND_DEFS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'flipped' ? (
              <select
                value={rec.flipped ? 1 : 0}
                onChange={e => {
                  setKey('flipped', Number(e.target.value) === 1);
                }}
              >
                <option value={0}>left</option>
                <option value={1}>right</option>
              </select>
            ) : (
              <input
                type="number"
                step={param.name === 'opacity' ? 0.05 : param.step ?? 1}
                value={
                  param.name === 'flipped'
                    ? rec.flipped
                      ? 1
                      : 0
                    : num(rec[param.name])
                }
                onChange={e => {
                  const v = Number(e.target.value);
                  if (
                    param.name === 'rot' ||
                    param.name === 'angle' ||
                    param.name === 'restAngle' ||
                    param.name === 'upAngle'
                  ) {
                    setKey(param.name, roundAngle(v));
                    return;
                  }
                  setKey(
                    param.name,
                    v,
                    param.name === 'x' ||
                      param.name === 'y' ||
                      param.name === 'w' ||
                      param.name === 'h' ||
                      param.name === 'wall' ||
                      param.name === 'part' ||
                      param.name === 'startOn' ||
                      param.name === 'onDelay' ||
                      param.name === 'offDelay' ||
                      param.name === 'x0' ||
                      param.name === 'y0' ||
                      param.name === 'x1' ||
                      param.name === 'y1' ||
                      param.name === 'interval' ||
                      param.name === 'texture' ||
                      param.name === 'shape' ||
                      param.name === 'icon' ||
                      param.name === 'color' ||
                      param.name === 'count' ||
                      param.name === 'delay'
                  );
                }}
              />
            )}
          </div>
        )
      )}
      {isPartKind(call.kind) ? (
        <div className="field">
          <label>opacity</label>
          <input
            type="number"
            step={0.05}
            min={0}
            max={1}
            value={
              'opacity' in call && call.opacity != null ? call.opacity : 1
            }
            onChange={e => {
              setKey('opacity', Number(e.target.value));
            }}
          />
        </div>
      ) : null}
      {call.kind === B_WALLS ? (
        <p className="status">Drag on the canvas to add segments.</p>
      ) : null}
    </div>
  );
};
