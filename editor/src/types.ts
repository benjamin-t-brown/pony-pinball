import type { MachineCall } from '@game/machine/MachineCalls';

export type SectionData = [
  number,
  number,
  number,
  number,
  MachineCall[],
];

export type Opening = {
  a: number;
  aSide: number;
  b: number;
  bSide: number;
  offset: number;
  width: number;
};

export type Tool =
  | { kind: 'select' }
  | { kind: 'section' }
  | { kind: 'opening' }
  | { kind: 'builder'; id: number };

export type Selection =
  | { kind: 'section'; index: number }
  | { kind: 'call'; section: number; call: number }
  | { kind: 'wall'; section: number; call: number; segment: number }
  | { kind: 'opening'; index: number }
  | null;

export type Cam = {
  x: number;
  y: number;
  scale: number;
};
