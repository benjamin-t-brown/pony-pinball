import type { SectionData, Selection } from '../types';
import { cloneSections } from '../geometry';

type Props = {
  sections: SectionData[];
  selection: Selection;
  onChange: (sections: SectionData[]) => void;
  goalSection: number;
  onGoalSection: (section: number) => void;
};

export const SectionForm = ({
  sections,
  selection,
  onChange,
  goalSection,
  onGoalSection,
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

  if (!section) {
    return null;
  }

  return (
    <div>
      <h2>Section {index}</h2>
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
      {goalSection >= 0 ? (
        <label className="check">
          <input
            type="checkbox"
            checked={goalSection === index}
            onChange={() => {
              onGoalSection(index);
            }}
          />
          win room
        </label>
      ) : null}
    </div>
  );
};
