import type { Opening, SectionData, Selection, Tool } from '../types';
import type { MachineMeta } from '@game/machine/MachineTypes';
import type { MachineInfo } from '../api';
import type { Issue } from '../validation';
import { BuilderForm } from './BuilderForm';
import { BuilderPalette } from './BuilderPalette';
import { MachineForm } from './MachineForm';
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
  catalog: MachineInfo[];
  fileId: string;
  onSelectMachine: (id: string) => void;
  onNewMachine: () => void;
  meta: MachineMeta;
  spawn: { x: number; y: number } | null;
  onMeta: (meta: MachineMeta) => void;
  onSpawn: (spawn: { x: number; y: number }) => void;
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
  catalog,
  fileId,
  onSelectMachine,
  onNewMachine,
  meta,
  spawn,
  onMeta,
  onSpawn,
}: Props) => {
  return (
    <aside className="sidebar">
      <h1>{meta.name || 'Level editor'}</h1>
      <div className="row">
        <select
          value={fileId}
          disabled={playing || catalog.length === 0}
          onChange={e => {
            onSelectMachine(e.target.value);
          }}
        >
          {catalog.length === 0 ? (
            <option value="">No tables</option>
          ) : null}
          {fileId && !catalog.some(m => m.id === fileId) ? (
            <option value={fileId}>{meta.name || fileId}</option>
          ) : null}
          {catalog.map(m => (
            <option key={m.id} value={m.id}>
              {m.name || m.id}
            </option>
          ))}
        </select>
        <button onClick={onNewMachine} disabled={playing}>
          New
        </button>
      </div>
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
        {sections.length} sections, {openings.length} openings.
      </p>
      <MachineForm
        meta={meta}
        spawn={spawn}
        sectionCount={sections.length}
        playing={playing}
        onMeta={onMeta}
        onSpawn={onSpawn}
      />
      <BuilderPalette tool={tool} onTool={onTool} />
      <SectionForm
        sections={sections}
        selection={selection}
        onChange={onSections}
      />
      <BuilderForm
        sections={sections}
        openings={openings}
        selection={selection}
        onChange={onSections}
        onSelection={onSelection}
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
