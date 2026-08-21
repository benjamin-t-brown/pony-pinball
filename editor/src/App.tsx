import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { B_WALLS, buildLevel } from '@game/model/builders';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '@game/model/Part';
import { updateSimulation } from '@game/sim/updateSimulation';
import type { State } from '@game/state/State';
import { LAUNCHER_X, LAUNCHER_Y } from '@game/model/constants';
import { loadLevels, saveLevels } from './api';
import { Sidebar } from './components/Sidebar';
import { WorldCanvas } from './components/WorldCanvas';
import { cloneSections, clampDeltaInRect, clampLocal, findSectionAt } from './geometry';
import { roundLevel } from './generateLevels';
import { ensureCallArgs } from './schema';
import {
  linksToOpenings,
  openingsToLinks,
  remapOpeningsAfterDelete,
} from './openings';
import { createPlayState, dropBall } from './sim';
import type { Cam, Opening, SectionData, Selection, Tool } from './types';
import { validateLevel } from './validation';
import { builtWallIndex, remapTriggerWalls } from './wallRefs';

const PHYSICS_DT_MS = 4;

const fitCam = (sections: SectionData[], viewW: number, viewH: number): Cam => {
  if (sections.length === 0) {
    return { x: -40, y: -40, scale: 1 };
  }
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    x0 = Math.min(x0, s[0]);
    y0 = Math.min(y0, s[1]);
    x1 = Math.max(x1, s[0] + s[2]);
    y1 = Math.max(y1, s[1] + s[3]);
  }
  const pad = 40;
  const w = Math.max(1, x1 - x0 + pad * 2);
  const h = Math.max(1, y1 - y0 + pad * 2);
  const scale = Math.min(viewW / w, viewH / h, 2);
  return {
    scale,
    x: x0 - pad,
    y: y0 - pad,
  };
};

export const App = () => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [tool, setTool] = useState<Tool>({ kind: 'select' });
  const [cam, setCam] = useState<Cam>({ x: -40, y: -40, scale: 0.7 });
  const [playing, setPlaying] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('Loading…');
  const [statusError, setStatusError] = useState(false);
  const [frame, setFrame] = useState(0);
  const [spawn, setSpawn] = useState<{ x: number; y: number } | null>(null);
  const simRef = useRef<State | null>(null);
  const spawnRef = useRef<{ x: number; y: number } | null>(null);
  const wrapSize = useRef({ w: 800, h: 600 });
  const mouseRef = useRef({ x: 0, y: 0 });

  const links = useMemo(
    () => openingsToLinks(sections, openings),
    [sections, openings]
  );

  const issues = useMemo(
    () => validateLevel(sections, openings),
    [sections, openings]
  );

  const built = useMemo(() => {
    if (playing && simRef.current) {
      return simRef.current.sections;
    }
    try {
      return buildLevel(sections, links);
    } catch {
      return [];
    }
  }, [sections, links, playing, frame]);

  const markDirty = useCallback((next: SectionData[]) => {
    setSections(next);
    setDirty(true);
  }, []);

  const markOpenings = useCallback((next: Opening[]) => {
    setOpenings(next);
    setDirty(true);
  }, []);

  const applyLoad = useCallback(
    (data: { sections: SectionData[]; links: number[][]; start?: number[] }, fitted: boolean) => {
      const cloned = cloneSections(data.sections);
      for (let i = 0; i < cloned.length; i++) {
        cloned[i][5] = cloned[i][5].map(ensureCallArgs);
      }
      setSections(cloned);
      setOpenings(linksToOpenings(cloned, data.links));
      setSelection(null);
      const at =
        data.start && data.start.length >= 2
          ? { x: data.start[0], y: data.start[1] }
          : { x: LAUNCHER_X, y: LAUNCHER_Y };
      spawnRef.current = at;
      setSpawn(at);
      setDirty(false);
      setStatusError(false);
      setStatus('Loaded src/levels.ts');
      if (fitted) {
        setCam(fitCam(cloned, wrapSize.current.w, wrapSize.current.h));
      }
    },
    []
  );

  useEffect(() => {
    loadLevels()
      .then(data => {
        applyLoad(data, true);
      })
      .catch(err => {
        setStatusError(true);
        setStatus(String(err));
      });
  }, [applyLoad]);

  useEffect(() => {
    if (!playing) {
      simRef.current = null;
      return;
    }
    simRef.current = createPlayState(sections, links, spawnRef.current);
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    const loop = (t: number) => {
      const dt = Math.min(33, t - last);
      last = t;
      acc += dt;
      const state = simRef.current;
      if (state) {
        while (acc >= PHYSICS_DT_MS) {
          updateSimulation(state, PHYSICS_DT_MS);
          acc -= PHYSICS_DT_MS;
        }
      }
      setFrame(n => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const setControl = (key: string, down: boolean) => {
      const state = simRef.current;
      if (!state) {
        return;
      }
      if (key === 'KeyZ' || key === 'ArrowLeft') {
        state.input[CONTROL_LEFT] = down;
      } else if (key === 'Slash' || key === 'ArrowRight') {
        state.input[CONTROL_RIGHT] = down;
      } else if (key === 'Space' || key === 'Enter') {
        state.input[CONTROL_START] = down;
      }
    };
    const down = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
        e.preventDefault();
      }
      setControl(e.code, true);
    };
    const up = (e: KeyboardEvent) => {
      setControl(e.code, false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [playing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelection(null);
        setTool({ kind: 'select' });
        if (playing) {
          onPlay(false);
        }
        return;
      }
      if (e.code === 'Space' && !playing) {
        e.preventDefault();
        if (!e.repeat) {
          onPlay(true);
        }
        return;
      }
      if (playing) {
        if (e.key.toLowerCase() === 'r' && !e.repeat) {
          e.preventDefault();
          const state = simRef.current;
          if (state) {
            dropBall(state, state.startX, state.startY);
            setFrame(n => n + 1);
          }
        }
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        setTool({ kind: 'select' });
        return;
      }
      if (k === 'o') {
        e.preventDefault();
        setTool({ kind: 'opening' });
        return;
      }
      if (k === 'w') {
        e.preventDefault();
        setTool({ kind: 'builder', id: B_WALLS });
        return;
      }
      if (k === 'c') {
        e.preventDefault();
        cloneSelected();
        return;
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') {
        return;
      }
      e.preventDefault();
      deleteSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  });

  const deleteSelection = () => {
    if (!selection) {
      return;
    }
    if (selection.kind === 'section') {
      if (!confirm('Delete this section?')) {
        return;
      }
      const next = cloneSections(sections);
      next.splice(selection.index, 1);
      markDirty(next);
      markOpenings(remapOpeningsAfterDelete(openings, selection.index));
      setSelection(null);
      return;
    }
    if (selection.kind === 'opening') {
      const next = openings.slice();
      next.splice(selection.index, 1);
      markOpenings(next);
      setSelection(null);
      return;
    }
    if (selection.kind === 'call') {
      const next = cloneSections(sections);
      next[selection.section][5].splice(selection.call, 1);
      markDirty(next);
      setSelection(null);
      return;
    }
    if (selection.kind === 'wall') {
      const next = cloneSections(sections);
      const call = next[selection.section][5][selection.call];
      const k = 1 + selection.segment * 4;
      const wallIndex = builtWallIndex(
        sections[selection.section],
        selection.section,
        selection.call,
        selection.segment,
        openingsToLinks(sections, openings)
      );
      call.splice(k, 4);
      if (call.length <= 1) {
        next[selection.section][5].splice(selection.call, 1);
      }
      remapTriggerWalls(next[selection.section][5], wallIndex);
      markDirty(next);
      setSelection(null);
    }
  };

  const cloneSelected = () => {
    if (!selection || (selection.kind !== 'call' && selection.kind !== 'wall')) {
      return;
    }
    const wx = mouseRef.current.x;
    const wy = mouseRef.current.y;
    let si = findSectionAt(sections, wx, wy);
    if (si < 0) {
      si = selection.section;
    }
    const dest = sections[si];
    if (!dest) {
      return;
    }
    const local = clampLocal(dest, wx - dest[0], wy - dest[1]);
    const next = cloneSections(sections);
    if (selection.kind === 'call') {
      const src = sections[selection.section][5][selection.call];
      if (!src || src[0] === B_WALLS) {
        return;
      }
      const copy = src.slice();
      copy[1] = local.x;
      copy[2] = local.y;
      next[si][5].push(copy);
      markDirty(next);
      setSelection({ kind: 'call', section: si, call: next[si][5].length - 1 });
      return;
    }
    const src = sections[selection.section][5][selection.call];
    const k = 1 + selection.segment * 4;
    if (!src || src.length < k + 4) {
      return;
    }
    const dx = src[k + 2] - src[k];
    const dy = src[k + 3] - src[k + 1];
    const x0 = local.x;
    const y0 = local.y;
    const x1 = local.x + dx;
    const y1 = local.y + dy;
    const shift = clampDeltaInRect(x0, y0, x1, y1, 0, 0, dest[2], dest[3]);
    let ci = -1;
    for (let i = 0; i < next[si][5].length; i++) {
      if (next[si][5][i][0] === B_WALLS) {
        ci = i;
        break;
      }
    }
    if (ci < 0) {
      next[si][5].unshift([B_WALLS]);
      ci = 0;
    }
    next[si][5][ci].push(
      x0 + shift.dx,
      y0 + shift.dy,
      x1 + shift.dx,
      y1 + shift.dy
    );
    markDirty(next);
    setSelection({
      kind: 'wall',
      section: si,
      call: ci,
      segment: Math.floor((next[si][5][ci].length - 5) / 4),
    });
  };

  const onSave = async () => {
    try {
      const rounded = roundLevel(sections, links, spawnRef.current);
      await saveLevels(rounded.sections, rounded.links, rounded.start);
      setSections(rounded.sections);
      setOpenings(linksToOpenings(rounded.sections, rounded.links));
      const at = { x: rounded.start[0], y: rounded.start[1] };
      spawnRef.current = at;
      setSpawn(at);
      setDirty(false);
      setStatusError(false);
      setStatus('Saved src/levels.ts');
    } catch (err) {
      setStatusError(true);
      setStatus(String(err));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onSave]);

  const onLoad = async () => {
    if (dirty && !confirm('Discard unsaved changes?')) {
      return;
    }
    try {
      const data = await loadLevels();
      applyLoad(data, false);
      setPlaying(false);
    } catch (err) {
      setStatusError(true);
      setStatus(String(err));
    }
  };

  const onAddSection = () => {
    const next = cloneSections(sections);
    const x = sections.length ? sections[sections.length - 1][0] + sections[sections.length - 1][2] : 0;
    const y = sections.length ? sections[sections.length - 1][1] : 0;
    next.push([x, y, 400, 400, sections.length % 3, []]);
    markDirty(next);
    setSelection({ kind: 'section', index: next.length - 1 });
  };

  const onFit = () => {
    setCam(fitCam(sections, wrapSize.current.w, wrapSize.current.h));
  };

  const onViewport = useCallback((w: number, h: number) => {
    wrapSize.current = { w, h };
  }, []);

  const onDropBall = (x: number, y: number) => {
    const at = { x, y };
    spawnRef.current = at;
    setSpawn(at);
    setDirty(true);
    if (simRef.current) {
      dropBall(simRef.current, x, y);
      setFrame(n => n + 1);
    }
  };

  const onPlay = (next: boolean) => {
    setPlaying(next);
    if (next) {
      setSelection(null);
      setTool({ kind: 'select' });
      setStatusError(false);
      setStatus('Play: click to drop the ball');
    } else {
      setStatus(dirty ? 'Editing (unsaved)' : 'Editing');
    }
  };

  return (
    <div className="app">
      <Sidebar
        sections={sections}
        openings={openings}
        selection={selection}
        tool={tool}
        playing={playing}
        dirty={dirty}
        status={status}
        statusError={statusError}
        issues={issues}
        onSections={markDirty}
        onOpenings={markOpenings}
        onSelection={setSelection}
        onTool={setTool}
        onPlay={onPlay}
        onSave={onSave}
        onLoad={onLoad}
        onDelete={deleteSelection}
        onAddSection={onAddSection}
        onFit={onFit}
      />
      <WorldCanvas
        sections={sections}
        openings={openings}
        selection={selection}
        tool={tool}
        cam={cam}
        playing={playing}
        spawn={spawn}
        built={built}
        sim={playing ? simRef.current : null}
        onSections={markDirty}
        onOpenings={markOpenings}
        onSelection={setSelection}
        onTool={setTool}
        onCam={setCam}
        onDropBall={onDropBall}
        onViewport={onViewport}
        onCursor={(x, y) => {
          mouseRef.current = { x, y };
        }}
      />
    </div>
  );
};
