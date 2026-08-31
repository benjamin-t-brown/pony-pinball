import type { Part } from '../model/Part';
import type { Section } from '../model/SectionFuncs';
import type { Line } from '../sim/PhysicsFuncs';
import {
  B_FIELD,
  B_WALL_RESTI,
  TRIGGER_ACTIVATE_LIGHT,
  TRIGGER_DEACTIVATE_WALL,
  isPartKind,
  isWallKind,
  normalizeCall,
  num,
  partIdOf,
  setPartId,
  setWallIdAt,
  wallIdAt,
  wallSegmentCount,
  type MachineCall,
} from './MachineCalls';
import type { CollectGoal, Machine, MachineLink, MachineSection } from './MachineTypes';

export { partIdOf, setPartId, setWallIdAt, wallIdAt, wallSegmentCount };

export const isWallCall = (call: MachineCall) => {
  return isWallKind(call.kind);
};

export const isPartCall = (call: MachineCall) => {
  return isPartKind(call.kind);
};

export const edgeWallCount = (sectionIndex: number, links: MachineLink[]) => {
  let n = 0;
  for (let e = 0; e < 4; e++) {
    let gap = false;
    for (let k = 0; k < links.length; k++) {
      const l = links[k];
      if (l.section === sectionIndex && l.side === e && l.width) {
        gap = true;
        break;
      }
    }
    n += gap ? 2 : 1;
  }
  return n;
};

const maxIdInCall = (call: MachineCall) => {
  let max = 0;
  const n = wallSegmentCount(call);
  for (let s = 0; s < n; s++) {
    max = Math.max(max, wallIdAt(call, s));
  }
  max = Math.max(max, partIdOf(call));
  return max;
};

export const maxEntityId = (sections: MachineSection[]) => {
  let max = 0;
  for (let i = 0; i < sections.length; i++) {
    const calls = sections[i].calls;
    for (let j = 0; j < calls.length; j++) {
      max = Math.max(max, maxIdInCall(calls[j]));
    }
  }
  return max;
};

export const allocEntityId = (sections: MachineSection[]) => {
  return maxEntityId(sections) + 1;
};

export const findWallById = (section: Section, id: number) => {
  if (!id) {
    return undefined;
  }
  for (let i = 0; i < section.walls.length; i++) {
    if (section.walls[i].id === id) {
      return section.walls[i];
    }
  }
  return undefined;
};

export const findPartById = (section: Section, id: number) => {
  if (!id) {
    return undefined;
  }
  for (let i = 0; i < section.parts.length; i++) {
    if (section.parts[i].id === id) {
      return section.parts[i];
    }
  }
  return undefined;
};

export const findWallRef = (
  sections: Section[],
  sectionIndex: number,
  id: number
): Line | undefined => {
  const section = sections[sectionIndex];
  return section ? findWallById(section, id) : undefined;
};

export const findPartRef = (
  sections: Section[],
  sectionIndex: number,
  id: number
): Part | undefined => {
  const section = sections[sectionIndex];
  return section ? findPartById(section, id) : undefined;
};

export const stampMissingIds = (
  calls: MachineCall[],
  alloc: () => number
) => {
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    const n = wallSegmentCount(call);
    for (let s = 0; s < n; s++) {
      if (!wallIdAt(call, s)) {
        setWallIdAt(call, s, alloc());
      }
    }
    if (isPartKind(call.kind) && !partIdOf(call)) {
      setPartId(call, alloc());
    }
  }
};

export const reassignCallIds = (call: MachineCall, alloc: () => number) => {
  const n = wallSegmentCount(call);
  for (let s = 0; s < n; s++) {
    setWallIdAt(call, s, alloc());
  }
  if (isPartKind(call.kind)) {
    setPartId(call, alloc());
  }
};

export const wallIdsInCalls = (calls: MachineCall[]) => {
  const ids = new Set<number>();
  for (let i = 0; i < calls.length; i++) {
    const n = wallSegmentCount(calls[i]);
    for (let s = 0; s < n; s++) {
      const id = wallIdAt(calls[i], s);
      if (id) {
        ids.add(id);
      }
    }
  }
  return ids;
};

export const partIdsInCalls = (calls: MachineCall[]) => {
  const ids = new Set<number>();
  for (let i = 0; i < calls.length; i++) {
    const id = partIdOf(calls[i]);
    if (id) {
      ids.add(id);
    }
  }
  return ids;
};

const builtWallIndexOf = (
  calls: MachineCall[],
  callIndex: number,
  segment: number,
  edgeCount: number
) => {
  let index = edgeCount;
  for (let i = 0; i < callIndex; i++) {
    index += wallSegmentCount(calls[i]);
  }
  return index + segment;
};

const builtPartIndexOf = (calls: MachineCall[], callIndex: number) => {
  let index = 0;
  for (let i = 0; i < callIndex; i++) {
    if (isPartKind(calls[i].kind)) {
      index += 1;
    }
  }
  return index;
};

const indexToWallId = (
  calls: MachineCall[],
  edgeCount: number,
  wallIndex: number
) => {
  if (wallIndex < 0) {
    return 0;
  }
  if (wallIndex < edgeCount) {
    return 0;
  }
  for (let i = 0; i < calls.length; i++) {
    const n = wallSegmentCount(calls[i]);
    for (let s = 0; s < n; s++) {
      if (builtWallIndexOf(calls, i, s, edgeCount) === wallIndex) {
        return wallIdAt(calls[i], s);
      }
    }
  }
  return 0;
};

const indexToPartId = (calls: MachineCall[], partIndex: number) => {
  if (partIndex < 0) {
    return 0;
  }
  for (let i = 0; i < calls.length; i++) {
    if (!isPartKind(calls[i].kind)) {
      continue;
    }
    if (builtPartIndexOf(calls, i) === partIndex) {
      return partIdOf(calls[i]);
    }
  }
  return 0;
};

const remapTriggerArgs = (calls: MachineCall[], edgeCount: number) => {
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (call.kind !== B_FIELD) {
      continue;
    }
    if (call.trigger === TRIGGER_DEACTIVATE_WALL || call.trigger == null) {
      const raw = num(call.wall);
      const id = indexToWallId(calls, edgeCount, raw);
      if (id) {
        call.wall = id;
      }
    }
    if (call.trigger === TRIGGER_ACTIVATE_LIGHT) {
      const raw = num(call.part);
      const id = indexToPartId(calls, raw);
      if (id) {
        call.part = id;
      }
    }
  }
};

export const migrateMachineEntityIds = (machine: Machine): Machine => {
  const sections = machine.sections;
  for (let i = 0; i < sections.length; i++) {
    sections[i].calls = sections[i].calls.map(normalizeCall);
  }
  const already = machine.entityIdFormat === 1;
  let nextId = already ? maxEntityId(sections) + 1 : 1;
  const alloc = () => nextId++;
  for (let i = 0; i < sections.length; i++) {
    stampMissingIds(sections[i].calls, alloc);
  }
  machine.callFormat = 2;
  if (already) {
    return machine;
  }
  for (let i = 0; i < sections.length; i++) {
    remapTriggerArgs(sections[i].calls, edgeWallCount(i, machine.links));
  }
  const goals = machine.collectGoals;
  for (let g = 0; g < goals.length; g++) {
    const goal = goals[g];
    if (goal.disableWall) {
      const si = goal.disableWall.section;
      const raw = goal.disableWall.wall;
      if (raw && sections[si]) {
        const id = indexToWallId(
          sections[si].calls,
          edgeWallCount(si, machine.links),
          raw
        );
        if (id) {
          goal.disableWall = { section: si, wall: id };
        }
      }
    }
    if (goal.activatePart) {
      const si = goal.activatePart.section;
      const raw = goal.activatePart.part;
      if (raw && sections[si]) {
        const id = indexToPartId(sections[si].calls, raw);
        if (id) {
          goal.activatePart = { section: si, part: id };
        }
      }
    }
  }
  machine.entityIdFormat = 1;
  return machine;
};

export const goalsWithoutWallId = (
  goals: CollectGoal[],
  section: number,
  id: number
): CollectGoal[] => {
  if (!id) {
    return goals;
  }
  return goals.map(g => {
    if (
      !g.disableWall ||
      g.disableWall.section !== section ||
      g.disableWall.wall !== id
    ) {
      return g;
    }
    return { ...g, disableWall: undefined };
  });
};

export const goalsWithoutPartId = (
  goals: CollectGoal[],
  section: number,
  id: number
): CollectGoal[] => {
  if (!id) {
    return goals;
  }
  return goals.map(g => {
    if (
      !g.activatePart ||
      g.activatePart.section !== section ||
      g.activatePart.part !== id
    ) {
      return g;
    }
    return { ...g, activatePart: undefined };
  });
};

export const restiWallIds = (calls: MachineCall[]) => {
  const ids = new Set<number>();
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (call.kind === B_WALL_RESTI) {
      const id = wallIdAt(call, 0);
      if (id) {
        ids.add(id);
      }
    }
  }
  return ids;
};

export const clearRefsToWallId = (calls: MachineCall[], id: number) => {
  if (!id) {
    return;
  }
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (call.kind === B_FIELD && num(call.wall) === id) {
      call.wall = 0;
    }
  }
};

export const clearRefsToPartId = (calls: MachineCall[], id: number) => {
  if (!id) {
    return;
  }
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (call.kind === B_FIELD && num(call.part) === id) {
      call.part = 0;
    }
  }
};
