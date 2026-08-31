import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import {
  normalizePath,
  type ModuleNode,
  type Plugin,
  type ViteDevServer,
} from 'vite';

const CURRENT_FILE = 'Current.ts';

const readBody = (req: IncomingMessage) => {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => {
      chunks.push(chunk as Buffer);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
};

const sendJson = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const roundStart = (start?: { x: number; y: number } | number[]) => {
  if (!start) {
    return { x: 384, y: 582 };
  }
  if (Array.isArray(start)) {
    return { x: Math.round(start[0]), y: Math.round(start[1]) };
  }
  return { x: Math.round(start.x), y: Math.round(start.y) };
};

const pathnameOf = (req: IncomingMessage) => {
  const raw = (req.url || '').split('?')[0];
  return decodeURIComponent(raw.replace(/\/$/, '') || '/');
};

const isUnderDir = (file: string, dir: string) => {
  const rel = path.relative(dir, file);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};

const invalidateFile = (server: ViteDevServer, file: string) => {
  const seen = new Set<ModuleNode>();
  const drop = (mod: ModuleNode | undefined) => {
    if (!mod || seen.has(mod)) {
      return;
    }
    seen.add(mod);
    server.moduleGraph.invalidateModule(mod);
  };
  drop(server.moduleGraph.getModuleById(file));
  const byFile = server.moduleGraph.getModulesByFile(file);
  if (byFile) {
    for (const mod of byFile) {
      drop(mod);
    }
  }
  server.watcher.unwatch(file);
};

type FormatMod = {
  sanitizeMachineId: (id: string) => string;
  machineFileStem: (id: string) => string;
  RESERVED_MACHINE_IDS: Set<string>;
  withMachineDefaults: (partial: unknown) => unknown;
  machineFromModule: (mod: unknown) => { id: string; name: string };
  blankMachine: (id: string, name?: string, goalKind?: number) => unknown;
};

type GenMod = {
  generateMachineTs: (machine: unknown) => string;
};

export const machinesApiPlugin = (repoRoot: string): Plugin => {
  const tablesDir = normalizePath(path.resolve(repoRoot, 'src', 'tables'));
  const currentPath = normalizePath(path.join(tablesDir, CURRENT_FILE));

  const machinePathFromStem = (stem: string) => {
    return normalizePath(path.join(tablesDir, `${stem}.ts`));
  };

  const machinePath = (id: string, format: FormatMod) => {
    return machinePathFromStem(format.machineFileStem(id));
  };

  const loadFormat = async (server: ViteDevServer) => {
    return (await server.ssrLoadModule('@game/machine/MachineFormats.ts')) as FormatMod;
  };

  const loadGen = async (server: ViteDevServer) => {
    return (await server.ssrLoadModule('/src/generateLevels.ts')) as GenMod;
  };

  const assertId = (id: string, format: FormatMod) => {
    const safe = format.sanitizeMachineId(id);
    if (format.RESERVED_MACHINE_IDS.has(safe)) {
      throw new Error(`"${safe}" is reserved`);
    }
    return safe;
  };

  const writeCurrent = (id: string, format: FormatMod) => {
    fs.writeFileSync(
      currentPath,
      `export { machine } from './${format.machineFileStem(id)}';\n`
    );
  };

  const listStems = () => {
    if (!fs.existsSync(tablesDir)) {
      return [] as string[];
    }
    return fs
      .readdirSync(tablesDir)
      .filter(name => name.endsWith('.ts') && name !== CURRENT_FILE)
      .map(name => name.slice(0, -3))
      .sort();
  };

  const unwatchMachines = (server: ViteDevServer) => {
    server.watcher.unwatch(tablesDir);
    server.watcher.unwatch(currentPath);
    for (const stem of listStems()) {
      server.watcher.unwatch(machinePathFromStem(stem));
    }
  };

  const invalidateStem = (server: ViteDevServer, stem: string) => {
    const file = machinePathFromStem(stem);
    invalidateFile(server, file);
    dropAlias(server, `@game/tables/${stem}.ts`);
    invalidateFile(server, currentPath);
    dropAlias(server, '@game/tables/Current.ts');
    unwatchMachines(server);
  };

  const dropAlias = (server: ViteDevServer, id: string) => {
    const mod = server.moduleGraph.getModuleById(id);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
    }
  };

  return {
    name: 'machines-api',
    configureServer(server: ViteDevServer) {
      unwatchMachines(server);
      server.middlewares.use(async (req, res, next) => {
        const pathname = pathnameOf(req);
        if (!pathname.startsWith('/api/machines')) {
          next();
          return;
        }
        try {
          if (pathname === '/api/machines') {
            if (req.method === 'GET') {
              unwatchMachines(server);
              const format = await loadFormat(server);
              const machines = [];
              for (const stem of listStems()) {
                invalidateStem(server, stem);
                try {
                  const mod = await server.ssrLoadModule(
                    `@game/tables/${stem}.ts`
                  );
                  const machine = format.machineFromModule(mod);
                  machines.push({
                    id: machine.id || format.sanitizeMachineId(stem),
                    name: machine.name || stem,
                  });
                } catch {
                  machines.push({
                    id: format.sanitizeMachineId(stem),
                    name: stem,
                  });
                }
              }
              let current = '';
              if (fs.existsSync(currentPath)) {
                try {
                  const curMod = await server.ssrLoadModule(
                    '@game/tables/Current.ts'
                  );
                  current = format.machineFromModule(curMod).id || '';
                } catch {
                  current = '';
                }
              }
              unwatchMachines(server);
              sendJson(res, 200, {
                current,
                machines,
              });
              return;
            }
            if (req.method === 'POST') {
              const raw = await readBody(req);
              const data = JSON.parse(raw || '{}') as {
                id?: string;
                name?: string;
                goalKind?: number;
              };
              const format = await loadFormat(server);
              const id = assertId(data.id || '', format);
              const dest = machinePath(id, format);
              if (fs.existsSync(dest)) {
                sendJson(res, 409, { error: `${id} already exists` });
                return;
              }
              const gen = await loadGen(server);
              const machine = format.blankMachine(id, data.name, data.goalKind);
              fs.mkdirSync(tablesDir, { recursive: true });
              fs.writeFileSync(dest, gen.generateMachineTs(machine));
              writeCurrent(id, format);
              invalidateStem(server, format.machineFileStem(id));
              sendJson(res, 201, { ok: true, machine });
              return;
            }
            next();
            return;
          }

          const match = pathname.match(/^\/api\/machines\/([^/]+)$/);
          if (!match) {
            next();
            return;
          }
          const format = await loadFormat(server);
          const id = assertId(match[1], format);
          const dest = machinePath(id, format);

          if (req.method === 'GET') {
            if (!fs.existsSync(dest)) {
              sendJson(res, 404, { error: `unknown machine ${id}` });
              return;
            }
            invalidateStem(server, format.machineFileStem(id));
            const mod = await server.ssrLoadModule(
              `@game/tables/${format.machineFileStem(id)}.ts`
            );
            unwatchMachines(server);
            sendJson(res, 200, format.machineFromModule(mod));
            return;
          }

          if (req.method === 'POST') {
            const raw = await readBody(req);
            const data = JSON.parse(raw) as {
              id?: string;
              name?: string;
              start?: { x: number; y: number };
              completeSection?: number;
              menuTour?: number[];
              menuTourMs?: number;
              scoreKeys?: { last: string; best: string };
              collectGoals?: unknown[];
              sections?: unknown[];
              links?: unknown[];
            };
            if (!Array.isArray(data.sections) || !Array.isArray(data.links)) {
              sendJson(res, 400, {
                error: 'sections and links arrays required',
              });
              return;
            }
            const writeId = assertId(data.id || id, format);
            const writeDest = machinePath(writeId, format);
            const root = path.resolve(repoRoot);
            const resolved = path.resolve(writeDest);
            const rel = path.relative(root, resolved);
            if (rel.startsWith('..') || path.isAbsolute(rel)) {
              sendJson(res, 400, { error: 'invalid path' });
            } else {
              const gen = await loadGen(server);
              const machine = format.withMachineDefaults({
                ...data,
                id: writeId,
                start: roundStart(data.start),
              });
              fs.mkdirSync(tablesDir, { recursive: true });
              fs.writeFileSync(writeDest, gen.generateMachineTs(machine));
              writeCurrent(writeId, format);
              invalidateStem(server, format.machineFileStem(writeId));
              sendJson(res, 200, { ok: true, id: writeId });
            }
            return;
          }

          next();
        } catch (err) {
          sendJson(res, 500, { error: String(err) });
        }
      });
    },
    handleHotUpdate({ file }) {
      if (isUnderDir(file, tablesDir) || normalizePath(file) === currentPath) {
        return [];
      }
    },
  };
};
