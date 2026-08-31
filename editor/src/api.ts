import type { Machine } from '@game/machine/MachineTypes';

export type MachineInfo = {
  id: string;
  name: string;
};

export type MachineCatalog = {
  current: string;
  machines: MachineInfo[];
};

const throwIfNotOk = async (res: Response, fallback: string) => {
  if (res.ok) {
    return;
  }
  const body = await res.json().catch(() => ({}));
  throw new Error((body as { error?: string }).error || fallback);
};

export const listMachines = async (): Promise<MachineCatalog> => {
  const res = await fetch('/api/machines');
  await throwIfNotOk(res, 'Failed to list machines');
  return (await res.json()) as MachineCatalog;
};

export const loadMachine = async (id: string): Promise<Machine> => {
  const res = await fetch(`/api/machines/${encodeURIComponent(id)}`);
  await throwIfNotOk(res, 'Failed to load machine');
  return (await res.json()) as Machine;
};

export const saveMachine = async (machine: Machine) => {
  const id = machine.id;
  const res = await fetch(`/api/machines/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(machine),
  });
  await throwIfNotOk(res, 'Failed to save');
};

export const createMachine = async (
  id: string,
  name?: string
): Promise<Machine> => {
  const res = await fetch('/api/machines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  });
  await throwIfNotOk(res, 'Failed to create machine');
  const body = (await res.json()) as { machine: Machine };
  return body.machine;
};
