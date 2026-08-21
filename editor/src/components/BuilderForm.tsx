import {
  B_COLLECTABLE,
  B_FIELD,
  B_WALL_GATE,
  B_WALL_RESTI,
  B_WALLS,
  GATE_COLORS,
} from '@game/model/builders';
import type { Opening, SectionData, Selection } from '../types';
import { defFor, TRIGGER_DEFS, triggerDefFor } from '../schema';
import { cloneSections } from '../geometry';
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
  const call = section[5][selection.call];
  if (!call) {
    return null;
  }

  const setArg = (index: number, value: number, round = false) => {
    const next = cloneSections(sections);
    const nextCall = next[selection.section][5][selection.call];
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
  const params = def
    ? def.params
    : call.slice(1).map((_n: number, i: number) => ({ name: `arg${i}` }));
  const extra = trig ? trig.args.map(name => ({ name })) : [];
  return (
    <div>
      <h2>{def ? def.name : `Builder ${call[0]}`}</h2>
      {[...params, ...extra].map((param: { name: string; step?: number }, i: number) => (
          <div className="field" key={param.name + i}>
            <label>{param.name}</label>
            {param.name === 'trigger' ? (
              <select
                value={call[i + 1] ?? 0}
                onChange={e => {
                  const id = Number(e.target.value);
                  const next = cloneSections(sections);
                  const nextCall = next[selection.section][5][selection.call];
                  nextCall[5] = id;
                  const names = triggerDefFor(id).args;
                  const n = 6 + names.length;
                  while (nextCall.length < n) {
                    nextCall.push(0);
                  }
                  nextCall.length = n;
                  onChange(next);
                }}
              >
                {TRIGGER_DEFS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : param.name === 'color' ? (
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
            ) : (
              <input
                type="number"
                step={param.step ?? 1}
                value={call[i + 1] ?? 0}
                onChange={e => {
                  setArg(
                    i + 1,
                    Number(e.target.value),
                    param.name === 'x' ||
                      param.name === 'y' ||
                      param.name === 'w' ||
                      param.name === 'h' ||
                      param.name === 'wall' ||
                      param.name === 'section' ||
                      param.name === 'needed' ||
                      param.name === 'groupType' ||
                      param.name === 'onDelay' ||
                      param.name === 'offDelay' ||
                      param.name === 'x0' ||
                      param.name === 'y0' ||
                      param.name === 'x1' ||
                      param.name === 'y1'
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
