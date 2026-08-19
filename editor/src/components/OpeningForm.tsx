import type { Opening, SectionData, Selection } from '../types';
import { clampOpening } from '../openings';

const SIDES = ['bottom', 'top', 'left', 'right'];

type Props = {
  sections: SectionData[];
  openings: Opening[];
  selection: Selection;
  onChange: (openings: Opening[]) => void;
};

export const OpeningForm = ({
  sections,
  openings,
  selection,
  onChange,
}: Props) => {
  if (!selection || selection.kind !== 'opening') {
    return null;
  }
  const opening = openings[selection.index];
  if (!opening) {
    return null;
  }

  const set = (patch: Partial<Opening>) => {
    const next = openings.slice();
    next[selection.index] = clampOpening({ ...opening, ...patch }, sections);
    onChange(next);
  };

  return (
    <div>
      <h2>Opening</h2>
      <p className="status">
        {opening.a} {SIDES[opening.aSide] || opening.aSide}
        {opening.b >= 0
          ? ` ↔ ${opening.b} ${SIDES[opening.bSide] || opening.bSide}`
          : ' (unpaired)'}
      </p>
      <div className="field">
        <label>offset (world)</label>
        <input
          type="number"
          value={opening.offset}
          onChange={e => {
            set({ offset: Number(e.target.value) });
          }}
        />
      </div>
      <div className="field">
        <label>width</label>
        <input
          type="number"
          value={opening.width}
          onChange={e => {
            set({ width: Number(e.target.value) });
          }}
        />
      </div>
    </div>
  );
};
