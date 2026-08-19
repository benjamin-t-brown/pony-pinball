import type { SectionData } from './types';

export const loadLevels = async () => {
  const res = await fetch('/api/levels');
  if (!res.ok) {
    throw new Error('Failed to load levels');
  }
  return (await res.json()) as {
    sections: SectionData[];
    links: number[][];
    start?: number[];
  };
};

export const saveLevels = async (
  sections: SectionData[],
  links: number[][],
  start: number[]
) => {
  const res = await fetch('/api/levels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sections, links, start }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || 'Failed to save');
  }
};
