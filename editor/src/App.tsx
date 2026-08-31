import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { B_WALL_GATE, B_WALL_RESTI, B_WALLS, buildLevel } from '@game/model/Builders';
import {
  CONTROL_LEFT,
  CONTROL_RIGHT,
  CONTROL_START,
} from '@game/model/Part';
import { updateSimulation } from '@game/sim/SimUpdate';
import type { State } from '@game/state/StateFuncs';
import { LAUNCHER_X, LAUNCHER_Y } from '@game/model/Constants';
import {
  assembleMachine,
  linksToTuples,
  machineMetaOf,
  PONY_MACHINE_META,
  remapMachineMetaAfterDelete,
  sanitizeMachineId,
  sectionsToTuples,
  tuplesToLinks,
  tuplesToSections,
} from '@game/machine/MachineFormats';
import {
  allocEntityId,
  clearRefsToPartId,
  clearRefsToWallId,
  goalsWithoutPartId,
  goalsWithoutWallId,
  migrateMachineEntityIds,
  partIdOf,
  reassignCallIds,
  stampMissingIds,
  wallIdAt,
  wallSegmentCount,
} from '@game/machine/EntityIdFuncs';
import {
  cloneCall,
  isSegmentWallKind,
  setCallAnchor,
  type WallsCall,
  wallSegAt,
} from '@game/machine/MachineCalls';
import type { Machine, MachineMeta } from '@game/machine/MachineTypes';
import { injectTextureCss } from '@game/model/parts/Decoration';
import { getHud, setActiveLook } from '@game/machine/MachineLook';
import {
  createMachine,
  listMachines,
  loadMachine,
  saveMachine,
  type MachineInfo,
} from './api';
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
import { validateLevel, validateMachine } from './validation';
import { partsAddedByCall } from './wallRefs';

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
  const [meta, setMeta] = useState<MachineMeta>(PONY_MACHINE_META);
  const metaRef = useRef<MachineMeta>(PONY_MACHINE_META);
  const [selection, setSelection] = useState<Selection>(null);
  const [tool, setTool] = useState<Tool>({ kind: 'select' });
  const [cam, setCam] = useState<Cam>({ x: -40, y: -40, scale: 0.7 });
  const [playing, setPlaying] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('Loading…');
  const [statusError, setStatusError] = useState(false);
  const [spawn, setSpawn] = useState<{ x: number; y: number } | null>(null);
  const [sim, setSim] = useState<State | null>(null);
  const [catalog, setCatalog] = useState<MachineInfo[]>([]);
  const [fileId, setFileId] = useState('');
  const simRef = useRef<State | null>(null);
  const spawnRef = useRef<{ x: number; y: number } | null>(null);
  const wrapSize = useRef({ w: 800, h: 600 });
  const mouseRef = useRef({ x: 0, y: 0 });

  const links = useMemo(
    () => openingsToLinks(sections, openings),
    [sections, openings]
  );

  const issues = useMemo(
    () => [
      ...validateLevel(sections, openings),
      ...validateMachine(meta, sections),
    ],
    [sections, openings, meta]
  );

  const built = useMemo(() => {
    try {
      return buildLevel(tuplesToSections(sections), tuplesToLinks(links));
    } catch {
      return [];
    }
  }, [sections, links]);

  const markDirty = useCallback((next: SectionData[]) => {
    let nextId = allocEntityId(
      next.map(s => ({ x: s[0], y: s[1], w: s[2], h: s[3], calls: s[4] }))
    );
    for (let i = 0; i < next.length; i++) {
      stampMissingIds(next[i][4], () => nextId++);
    }
    setSections(next);
    setDirty(true);
  }, []);

  const markOpenings = useCallback((next: Opening[]) => {
    setOpenings(next);
    setDirty(true);
  }, []);

  const markMeta = useCallback((next: MachineMeta) => {
    metaRef.current = next;
    setMeta(next);
    setDirty(true);
  }, []);

  const applyLoad = useCallback(
    (data: Machine, fitted: boolean, loadedId: string) => {
      const ready = migrateMachineEntityIds({
        ...data,
        sections: data.sections.map(s => ({
          ...s,
          calls: s.calls.map(c => cloneCall(c)),
        })),
        collectGoals: data.collectGoals.map(g => ({
          ...g,
          disableWall: g.disableWall ? { ...g.disableWall } : undefined,
          activatePart: g.activatePart ? { ...g.activatePart } : undefined,
        })),
        links: data.links.map(l => ({ ...l })),
      });
      const loaded = machineMetaOf(ready);
      metaRef.current = loaded;
      setMeta(loaded);
      setFileId(loadedId);
      const cloned = cloneSections(sectionsToTuples(ready.sections));
      for (let i = 0; i < cloned.length; i++) {
        cloned[i][4] = cloned[i][4].map(ensureCallArgs);
      }
      setSections(cloned);
      setOpenings(linksToOpenings(cloned, linksToTuples(ready.links)));
      setSelection(null);
      const at = ready.start
        ? { x: ready.start.x, y: ready.start.y }
        : { x: LAUNCHER_X, y: LAUNCHER_Y };
      spawnRef.current = at;
      setSpawn(at);
      setDirty(false);
      setStatusError(false);
      setStatus(`Loaded ${loadedId}`);
      if (fitted) {
        setCam(fitCam(cloned, wrapSize.current.w, wrapSize.current.h));
      }
    },
    []
  );

  const refreshCatalog = useCallback(async () => {
    const data = await listMachines();
    setCatalog(data.machines);
    return data;
  }, []);

  useEffect(() => {
    const boot = async () => {
      const listed = await refreshCatalog();
      const id =
        listed.current ||
        listed.machines.find(m => m.id === 'pony')?.id ||
        listed.machines[0]?.id;
      if (!id) {
        throw new Error('No tables in src/tables');
      }
      const data = await loadMachine(id);
      applyLoad(data, true, id);
    };
    boot().catch(err => {
      setStatusError(true);
      setStatus(String(err));
    });
  }, [applyLoad, refreshCatalog]);

  useEffect(() => {
    document.title = meta.name ? `${meta.name} — editor` : 'Level editor';
  }, [meta.name]);

  useEffect(() => {
    setActiveLook(meta);
    injectTextureCss();
  }, [meta]);

  useEffect(() => {
    if (!playing) {
      simRef.current = null;
      setSim(null);
      return;
    }
    const state = createPlayState(
      sections,
      links,
      spawnRef.current,
      metaRef.current
    );
    simRef.current = state;
    setSim(state);
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    const loop = (t: number) => {
      const dt = Math.min(33, t - last);
      last = t;
      acc += dt;
      const s = simRef.current;
      if (s) {
        while (acc >= PHYSICS_DT_MS) {
          updateSimulation(s, PHYSICS_DT_MS);
          acc -= PHYSICS_DT_MS;
        }
      }
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
      const hud = getHud();
      if (hud.flippers && (key === 'KeyZ' || key === 'ArrowLeft')) {
        state.input[CONTROL_LEFT] = down;
      } else if (hud.flippers && (key === 'Slash' || key === 'ArrowRight')) {
        state.input[CONTROL_RIGHT] = down;
      } else if (hud.launcher && (key === 'Space' || key === 'Enter')) {
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
      markMeta(remapMachineMetaAfterDelete(metaRef.current, selection.index));
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
      const call = sections[selection.section][4][selection.call];
      const si = selection.section;
      let goals = metaRef.current.collectGoals;
      if (call) {
        const n = wallSegmentCount(call);
        for (let s = 0; s < n; s++) {
          const id = wallIdAt(call, s);
          clearRefsToWallId(next[si][4], id);
          goals = goalsWithoutWallId(goals, si, id);
        }
        if (partsAddedByCall(call)) {
          const id = partIdOf(call);
          clearRefsToPartId(next[si][4], id);
          goals = goalsWithoutPartId(goals, si, id);
        }
      }
      next[si][4].splice(selection.call, 1);
      markDirty(next);
      markMeta({ ...metaRef.current, collectGoals: goals });
      setSelection(null);
      return;
    }
    if (selection.kind === 'wall') {
      const next = cloneSections(sections);
      const call = next[selection.section][4][selection.call];
      const si = selection.section;
      const id = wallIdAt(call, selection.segment);
      if (isSegmentWallKind(call.kind)) {
        next[si][4].splice(selection.call, 1);
      } else if (call.kind === B_WALLS) {
        call.segments.splice(selection.segment, 1);
        if (call.segments.length === 0) {
          next[si][4].splice(selection.call, 1);
        }
      }
      clearRefsToWallId(next[si][4], id);
      markDirty(next);
      markMeta({
        ...metaRef.current,
        collectGoals: goalsWithoutWallId(metaRef.current.collectGoals, si, id),
      });
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
    let nextId = allocEntityId(
      next.map(s => ({ x: s[0], y: s[1], w: s[2], h: s[3], calls: s[4] }))
    );
    if (selection.kind === 'call') {
      const src = sections[selection.section][4][selection.call];
      if (!src || src.kind === B_WALLS) {
        return;
      }
      const copy = cloneCall(src);
      setCallAnchor(copy, local.x, local.y);
      reassignCallIds(copy, () => nextId++);
      next[si][4].push(copy);
      markDirty(next);
      setSelection({ kind: 'call', section: si, call: next[si][4].length - 1 });
      return;
    }
    const src = sections[selection.section][4][selection.call];
    const seg = src && wallSegAt(src, selection.segment);
    if (!src || !seg) {
      return;
    }
    const dx = seg.x1 - seg.x0;
    const dy = seg.y1 - seg.y0;
    const x0 = local.x;
    const y0 = local.y;
    const x1 = local.x + dx;
    const y1 = local.y + dy;
    const shift = clampDeltaInRect(x0, y0, x1, y1, 0, 0, dest[2], dest[3]);
    if (isSegmentWallKind(src.kind)) {
      if (src.kind === B_WALL_RESTI) {
        next[si][4].push({
          kind: B_WALL_RESTI,
          x0: x0 + shift.dx,
          y0: y0 + shift.dy,
          x1: x1 + shift.dx,
          y1: y1 + shift.dy,
          rest: src.rest ?? 0.5,
          id: nextId++,
        });
      } else if (src.kind === B_WALL_GATE) {
        next[si][4].push({
          kind: B_WALL_GATE,
          x0: x0 + shift.dx,
          y0: y0 + shift.dy,
          x1: x1 + shift.dx,
          y1: y1 + shift.dy,
          color: src.color ?? 0,
          id: nextId++,
        });
      }
      markDirty(next);
      setSelection({
        kind: 'wall',
        section: si,
        call: next[si][4].length - 1,
        segment: 0,
      });
      return;
    }
    let ci = -1;
    for (let i = 0; i < next[si][4].length; i++) {
      if (next[si][4][i].kind === B_WALLS) {
        ci = i;
        break;
      }
    }
    if (ci < 0) {
      next[si][4].unshift({ kind: B_WALLS, segments: [] });
      ci = 0;
    }
    (next[si][4][ci] as WallsCall).segments.push({
      x0: x0 + shift.dx,
      y0: y0 + shift.dy,
      x1: x1 + shift.dx,
      y1: y1 + shift.dy,
      id: nextId++,
    });
    markDirty(next);
    setSelection({
      kind: 'wall',
      section: si,
      call: ci,
      segment: wallSegmentCount(next[si][4][ci]) - 1,
    });
  };

  const onSave = async () => {
    try {
      const rounded = roundLevel(sections, links, spawnRef.current);
      const id = sanitizeMachineId(metaRef.current.id);
      const nextMeta = { ...metaRef.current, id };
      metaRef.current = nextMeta;
      setMeta(nextMeta);
      const machine = {
        ...assembleMachine(
          nextMeta,
          rounded.sections,
          rounded.links,
          { x: rounded.start[0], y: rounded.start[1] }
        ),
        entityIdFormat: 1 as const,
      };
      await saveMachine(machine);
      setSections(rounded.sections);
      setOpenings(linksToOpenings(rounded.sections, rounded.links));
      const at = { x: rounded.start[0], y: rounded.start[1] };
      spawnRef.current = at;
      setSpawn(at);
      setFileId(id);
      setDirty(false);
      setStatusError(false);
      setStatus(`Saved ${id}`);
      await refreshCatalog();
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
    if (!fileId) {
      return;
    }
    if (dirty && !confirm('Discard unsaved changes?')) {
      return;
    }
    try {
      const data = await loadMachine(fileId);
      applyLoad(data, false, fileId);
      setPlaying(false);
    } catch (err) {
      setStatusError(true);
      setStatus(String(err));
    }
  };

  const onSelectMachine = async (id: string) => {
    if (id === fileId) {
      return;
    }
    if (dirty && !confirm('Discard unsaved changes?')) {
      return;
    }
    try {
      const data = await loadMachine(id);
      applyLoad(data, true, id);
      setPlaying(false);
    } catch (err) {
      setStatusError(true);
      setStatus(String(err));
    }
  };

  const onNewMachine = async () => {
    if (dirty && !confirm('Discard unsaved changes?')) {
      return;
    }
    const raw = window.prompt('New machine id', 'untitled');
    if (raw == null) {
      return;
    }
    const id = sanitizeMachineId(raw);
    try {
      const created = await createMachine(id);
      await refreshCatalog();
      applyLoad(created, true, id);
      setPlaying(false);
      setStatus(`Created ${id}`);
    } catch (err) {
      setStatusError(true);
      setStatus(String(err));
    }
  };

  const onAddSection = () => {
    const next = cloneSections(sections);
    const x = sections.length ? sections[sections.length - 1][0] + sections[sections.length - 1][2] : 0;
    const y = sections.length ? sections[sections.length - 1][1] : 0;
    next.push([x, y, 400, 400, []]);
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
        catalog={catalog}
        fileId={fileId}
        onSelectMachine={onSelectMachine}
        onNewMachine={onNewMachine}
        meta={meta}
        spawn={spawn}
        onMeta={markMeta}
        onSpawn={at => {
          onDropBall(at.x, at.y);
        }}
      />
      <WorldCanvas
        sections={sections}
        openings={openings}
        selection={selection}
        tool={tool}
        cam={cam}
        playing={playing}
        spawn={spawn}
        completeSection={meta.completeSection}
        menuTour={meta.menuTour}
        built={built}
        sim={sim}
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
