import type { Opening, SectionData, Selection, Tool } from '../types';
import type { MachineInfo } from '../api';
import type { MachineMeta } from '@game/machine/MachineTypes';
import {
  ballsOf,
  completeSectionOf,
  GOAL_DEFS,
  goalOf,
  goalUsesBalls,
} from '@game/machine/MachineGoals';
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
  catalog: MachineInfo[];
  fileId: string;
  onSelectMachine: (id: string) => void;
  onNewMachine: () => void;
  meta: MachineMeta;
  onGoalKind: (kind: number) => void;
  onGoalSection: (section: number) => void;
  onGoalBalls: (balls: number) => void;
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
  onGoalKind,
  onGoalSection,
  onGoalBalls,
}: Props) => {
  const selected = catalog.find(m => m.id === fileId);
  const label = (selected && selected.name) || fileId;

  return (
    <aside className="sidebar">
      <h1>Level editor</h1>
      <div className="field">
        <label>Machine</label>
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
            {fileId && !selected ? (
              <option value={fileId}>{label}</option>
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
      </div>
      <div className="field">
        <label>Type</label>
        <select
          value={goalOf(meta).kind}
          disabled={playing}
          onChange={e => {
            onGoalKind(Number(e.target.value));
          }}
        >
          {GOAL_DEFS.map(def => (
            <option key={def.kind} value={def.kind}>
              {def.label}
            </option>
          ))}
        </select>
      </div>
      {goalUsesBalls(goalOf(meta)) ? (
        <div className="field">
          <label>Balls</label>
          <input
            type="number"
            min={1}
            step={1}
            value={ballsOf(goalOf(meta))}
            disabled={playing}
            onChange={e => {
              onGoalBalls(Number(e.target.value));
            }}
          />
        </div>
      ) : null}
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
      <BuilderPalette tool={tool} onTool={onTool} />
      <SectionForm
        sections={sections}
        selection={selection}
        onChange={onSections}
        goalSection={completeSectionOf(meta)}
        onGoalSection={onGoalSection}
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
