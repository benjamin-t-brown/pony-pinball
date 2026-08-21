import { BG } from '@game/model/builders';
import type { Opening, SectionData, Selection, Tool } from '../types';
import type { Issue } from '../validation';
import { BuilderForm } from './BuilderForm';
import { BuilderPalette } from './BuilderPalette';
import { OpeningForm } from './OpeningForm';
import { SectionForm } from './SectionForm';
import { ValidationList } from './ValidationList';

type Props = {
  sections: SectionData[];
  openings: Opening[];
  selection: Selection;
  tool: Tool;
  playing: boolean;
  dirty: boolean;
  status: string;
  statusError: boolean;
  issues: Issue[];
  onSections: (sections: SectionData[]) => void;
  onOpenings: (openings: Opening[]) => void;
  onSelection: (selection: Selection) => void;
  onTool: (tool: Tool) => void;
  onPlay: (playing: boolean) => void;
  onSave: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onFit: () => void;
};

export const Sidebar = ({
  sections,
  openings,
  selection,
  tool,
  playing,
  dirty,
  status,
  statusError,
  issues,
  onSections,
  onOpenings,
  onSelection,
  onTool,
  onPlay,
  onSave,
  onLoad,
  onDelete,
  onAddSection,
  onFit,
}: Props) => {
  return (
    <aside className="sidebar">
      <h1>Level editor</h1>
      <div className="row">
        <button onClick={onSave}>
          Save{dirty ? ' *' : ''}
        </button>
        <button
          className={playing ? 'active' : ''}
          onClick={() => {
            onPlay(!playing);
          }}
        >
          {playing ? 'Stop' : 'Play'}
        </button>
        <button onClick={onFit}>Fit</button>
        <button className="push-right" onClick={onLoad}>
          Load
        </button>
      </div>
      <p className={'status' + (statusError ? ' error' : '')}>{status}</p>
      <div className="row">
        <button onClick={onAddSection} disabled={playing}>
          Add section
        </button>
        <button onClick={onDelete} disabled={playing || !selection}>
          Delete
        </button>
      </div>
      <p className="status">
        Palette {BG.length} colors. {sections.length} sections, {openings.length}{' '}
        openings.
      </p>
      <BuilderPalette tool={tool} onTool={onTool} />
      <SectionForm
        sections={sections}
        selection={selection}
        onChange={onSections}
        onSelect={index => {
          onSelection({ kind: 'section', index });
        }}
      />
      <BuilderForm
        sections={sections}
        selection={selection}
        onChange={onSections}
      />
      <OpeningForm
        sections={sections}
        openings={openings}
        selection={selection}
        onChange={onOpenings}
      />
      <ValidationList issues={issues} />
    </aside>
  );
};
