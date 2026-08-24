import type { SectionData, Selection } from '../types';
import { cloneSections } from '../geometry';

type Props = {
  sections: SectionData[];
  selection: Selection;
  onChange: (sections: SectionData[]) => void;
  onSelect: (index: number) => void;
};

export const SectionForm = ({
  sections,
  selection,
  onChange,
  onSelect,
}: Props) => {
  const index = selection && selection.kind === 'section' ? selection.index : -1;
  const section = index >= 0 ? sections[index] : null;

  const setField = (field: 0 | 1 | 2 | 3, value: number) => {
    if (index < 0) {
      return;
    }
    const next = cloneSections(sections);
    next[index][field] = Math.round(value);
    onChange(next);
  };

  return (
    <div>
      <h2>Sections</h2>
      <div className="section-list">
        {sections.map((s, i) => (
          <button
            key={i}
            className={i === index ? 'active' : ''}
            onClick={() => {
              onSelect(i);
            }}
          >
            {i}: {s[2]}×{s[3]} at ({s[0]}, {s[1]})
          </button>
        ))}
      </div>
      {section ? (
        <>
          {(['x', 'y', 'w', 'h'] as const).map((name, i) => (
            <div className="field" key={name}>
              <label>{name}</label>
              <input
                type="number"
                value={section[i] as number}
                onChange={e => {
                  setField(i as 0 | 1 | 2 | 3, Number(e.target.value));
                }}
              />
            </div>
          ))}
        </>
      ) : (
        <p className="status">Select a section to edit its rect.</p>
      )}
    </div>
  );
};
