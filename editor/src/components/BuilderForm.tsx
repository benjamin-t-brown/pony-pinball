import { B_WALLS } from '@game/model/builders';
import type { SectionData, Selection } from '../types';
import { defFor } from '../schema';
import { cloneSections } from '../geometry';

type Props = {
  sections: SectionData[];
  selection: Selection;
  onChange: (sections: SectionData[]) => void;
};

export const BuilderForm = ({ sections, selection, onChange }: Props) => {
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
    return (
      <div>
        <h2>Wall segment</h2>
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
      </div>
    );
  }

  const def = defFor(call[0]);
  return (
    <div>
      <h2>{def ? def.name : `Builder ${call[0]}`}</h2>
      {(def
        ? def.params
        : call.slice(1).map((_n: number, i: number) => ({ name: `arg${i}` }))
      ).map((param: { name: string; step?: number }, i: number) => (
          <div className="field" key={param.name}>
            <label>{param.name}</label>
            <input
              type="number"
              step={param.step ?? 1}
              value={call[i + 1] ?? 0}
              onChange={e => {
                setArg(
                  i + 1,
                  Number(e.target.value),
                  param.name === 'x' || param.name === 'y'
                );
              }}
            />
          </div>
        )
      )}
      {call[0] === B_WALLS ? (
        <p className="status">Drag on the canvas to add segments.</p>
      ) : null}
    </div>
  );
};
