import {
  B_COLLECTABLE,
  B_DECORATION,
  B_FIELD,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
  GATE_COLORS,
} from '@game/model/builders';
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

export const BuilderForm = ({
  sections,
  openings,
  selection,
  onChange,
  onSelection,
}: Props) => {
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

  const setArg = (index: number, value: number, round = false) => {
    const next = cloneSections(sections);
    const nextCall = next[selection.section][4][selection.call];
    while (nextCall.length <= index) {
      nextCall.push(0);
    }
    nextCall[index] = round ? Math.round(value) : value;
    onChange(next);
  };

  if (selection.kind === 'wall') {
    const k = 1 + selection.segment * 4;
    const title =
      call[0] === B_WALL_RESTI
        ? 'Wall resti'
        : call[0] === B_WALL_GATE
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
        {['x0', 'y0', 'x1', 'y1'].map((name, i) => (
          <div className="field" key={name}>
            <label>{name}</label>
            <input
              type="number"
              value={call[k + i] ?? 0}
              onChange={e => {
                setArg(k + i, Number(e.target.value), true);
              }}
            />
          </div>
        ))}
        {call[0] === B_WALL_RESTI ? (
          <div className="field">
            <label>restitution</label>
            <input
              type="number"
              step={0.05}
              value={call[5] ?? 0.5}
              onChange={e => {
                setArg(5, Number(e.target.value));
              }}
            />
          </div>
        ) : null}
        {call[0] === B_WALL_GATE ? (
          <div className="field">
            <label>color</label>
            <select
              value={call[5] ?? 0}
              onChange={e => {
                setArg(5, Number(e.target.value), true);
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
                background: GATE_COLORS[(call[5] ?? 0) % GATE_COLORS.length],
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
              disabled={call[0] === kind.id}
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

  const def = defFor(call[0]);
  const hasTrigger = call[0] === B_FIELD || call[0] === B_COLLECTABLE;
  const trig = hasTrigger ? triggerDefFor(call[5]) : null;
  const hasDecoration = call[0] === B_DECORATION;
  const dec = hasDecoration ? decorationDefFor(call[5]) : null;
  const params = def
    ? def.params
    : call.slice(1).map((_n: number, i: number) => ({ name: `arg${i}` }));
  const extra = trig
    ? trig.args.map(name => ({ name }))
    : dec
      ? dec.args.map(name => ({ name }))
      : [];
  return (
    <div>
      <h2>{def ? def.name : `Builder ${call[0]}`}</h2>
      {[...params, ...extra].map((param: { name: string; step?: number }, i: number) =>
        param.name === 'texture' && (call[5] | 0) === DEC_RAINBOW ? null : (
          <div className="field" key={param.name + i}>
            <label>{param.name}</label>
            {param.name === 'trigger' ? (
              <select
                value={call[i + 1] ?? 0}
                onChange={e => {
                  const id = Number(e.target.value);
                  const next = cloneSections(sections);
                  const nextCall = next[selection.section][4][selection.call];
                  nextCall[5] = id;
                  const names = triggerDefFor(id).args;
                  nextCall.length = 6;
                  for (let i = 0; i < names.length; i++) {
                    nextCall.push(triggerArgDefault(names[i], nextCall));
                  }
                  onChange(next);
                }}
              >
                {TRIGGER_DEFS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'decorationType' ? (
              <select
                value={call[i + 1] ?? 0}
                onChange={e => {
                  const id = Number(e.target.value);
                  const next = cloneSections(sections);
                  const nextCall = next[selection.section][4][selection.call];
                  nextCall[5] = id;
                  if (id === DEC_ICON && nextCall[6] === TEX_PALETTE) {
                    nextCall[6] = 0;
                  }
                  const names = decorationDefFor(id).args;
                  nextCall.length = 7;
                  for (let i = 0; i < names.length; i++) {
                    nextCall.push(decArgDefault(names[i], nextCall));
                  }
                  onChange(next);
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
                  value={call[i + 1] ?? 0}
                  onChange={e => {
                    setArg(i + 1, Number(e.target.value), true);
                  }}
                >
                  {GATE_COLORS.map((c, ti) => (
                    <option key={c} value={ti}>
                      {ti}: {c}
                    </option>
                  ))}
                  {(call[5] | 0) !== DEC_ICON ? (
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
                      (call[i + 1] ?? 0) === TEX_PALETTE
                        ? 'linear-gradient(90deg,' + GATE_COLORS.join(',') + ')'
                        : GATE_COLORS[(call[i + 1] ?? 0) % GATE_COLORS.length],
                    border: '1px solid #000',
                  }}
                />
              </>
            ) : param.name === 'shape' ? (
              <select
                value={call[i + 1] ?? 0}
                onChange={e => {
                  setArg(i + 1, Number(e.target.value), true);
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
                  value={call[i + 1] ?? 0}
                  onChange={e => {
                    setArg(i + 1, Number(e.target.value), true);
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
                      GATE_COLORS[(call[i + 1] ?? 0) % GATE_COLORS.length],
                    border: '1px solid #000',
                  }}
                />
              </>
            ) : param.name === 'icon' ? (
              <select
                value={call[i + 1] ?? 0}
                onChange={e => {
                  setArg(i + 1, Number(e.target.value), true);
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
                value={call[i + 1] ?? 1}
                onChange={e => {
                  setArg(i + 1, Number(e.target.value), true);
                }}
              >
                <option value={1}>on</option>
                <option value={0}>off</option>
              </select>
            ) : param.name === 'sound' ? (
              <select
                value={call[i + 1] ?? 0}
                onChange={e => {
                  setArg(i + 1, Number(e.target.value), true);
                }}
              >
                {SOUND_DEFS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                step={param.name === 'opacity' ? 0.05 : param.step ?? 1}
                value={call[i + 1] ?? 0}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (
                    param.name === 'rot' ||
                    param.name === 'angle' ||
                    param.name === 'restAngle' ||
                    param.name === 'upAngle' ||
                    param.name === 'startingRotation'
                  ) {
                    setArg(i + 1, roundAngle(v));
                    return;
                  }
                  setArg(
                    i + 1,
                    v,
                    param.name === 'x' ||
                      param.name === 'y' ||
                      param.name === 'w' ||
                      param.name === 'h' ||
                      param.name === 'destX' ||
                      param.name === 'destY' ||
                      param.name === 'destW' ||
                      param.name === 'destH' ||
                      param.name === 'wall' ||
                      param.name === 'part' ||
                      param.name === 'startOn' ||
                      param.name === 'section' ||
                      param.name === 'needed' ||
                      param.name === 'groupType' ||
                      param.name === 'onDelay' ||
                      param.name === 'offDelay' ||
                      param.name === 'x0' ||
                      param.name === 'y0' ||
                      param.name === 'x1' ||
                      param.name === 'y1' ||
                      param.name === 'interval' ||
                      param.name === 'decorationType' ||
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
      {call[0] === B_WALLS ? (
        <p className="status">Drag on the canvas to add segments.</p>
      ) : null}
    </div>
  );
};
