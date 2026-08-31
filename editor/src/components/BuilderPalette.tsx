import { B_WALLS } from '@game/model/builders';
import { BUILDER_DEFS } from '../schema';
import type { Tool } from '../types';

type Props = {
  tool: Tool;
  onTool: (tool: Tool) => void;
};

export const BuilderPalette = ({ tool, onTool }: Props) => {
  return (
    <div>
      <h2>Tools</h2>
      <div className="row">
        <button
          className={tool.kind === 'select' ? 'active' : ''}
          title="S"
          onClick={() => {
            onTool({ kind: 'select' });
          }}
        >
          Select
        </button>
        <button
          className={tool.kind === 'section' ? 'active' : ''}
          onClick={() => {
            onTool({ kind: 'section' });
          }}
        >
          Section
        </button>
        <button
          className={tool.kind === 'opening' ? 'active' : ''}
          title="O"
          onClick={() => {
            onTool({ kind: 'opening' });
          }}
        >
          Opening
        </button>
      </div>
      <h2>Builders</h2>
      <div className="row">
        {BUILDER_DEFS.map(def => (
          <button
            key={def.id}
            className={tool.kind === 'builder' && tool.id === def.id ? 'active' : ''}
            title={def.id === B_WALLS ? 'W' : undefined}
            onClick={() => {
              onTool({ kind: 'builder', id: def.id });
            }}
          >
            {def.name}
          </button>
        ))}
      </div>
    </div>
  );
};
