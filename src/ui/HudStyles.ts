import { POINTER_EVENTS } from '../DomFuncs';
import { accent, sectionBg } from '../machine/MachineLook';

export const hudOverlay: Record<string, string> = {
  position: 'absolute',
  inset: '0',
  'z-index': '8',
  background: 'rgba(0,0,0,0.2)',
  [POINTER_EVENTS]: 'none',
};

export const hudBtn = (): Record<string, string> => ({
  position: 'absolute',
  [POINTER_EVENTS]: 'auto',
  cursor: 'pointer',
  color: sectionBg(),
  background: accent(),
  border: '0',
  padding: '0',
  'font-size': '18px',
  'font-weight': 'bold',
});

export const hudLabel: Record<string, string> = {
  position: 'absolute',
  left: '0',
  right: '0',
  'text-align': 'center',
  'font-size': '16px',
  [POINTER_EVENTS]: 'none',
};
