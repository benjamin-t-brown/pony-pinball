import { createBarrel } from './objects';

export interface ObjectRegistryEntry {
  id: string;
  name: string;
  create: () => HTMLElement;
}

export const objectRegistry: ObjectRegistryEntry[] = [
  { id: 'barrel', name: 'Barrel', create: createBarrel },
];
