import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import type { Plugin, ViteDevServer } from 'vite';

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

const roundStart = (start?: number[]) => {
  if (!start || start.length < 2) {
    return [384, 582];
  }
  return [Math.round(start[0]), Math.round(start[1])];
};

const ensureStartExport = (source: string, start: number[]) => {
  const line = `export const START = [${start[0]}, ${start[1]}];`;
  if (/export const START\s*=/.test(source)) {
    return source.replace(/export const START\s*=\s*\[[^\]]*\];/, line);
  }
  return `${source.replace(/\s*$/, '')}\n\n/** world x, y */\n${line}\n`;
};

export const levelsApiPlugin = (repoRoot: string): Plugin => {
  const levelsPath = path.join(repoRoot, 'src', 'levels.ts');
  return {
    name: 'levels-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/levels', (req, res, next) => {
        const handle = async () => {
          if (req.method === 'GET') {
            const mod = await server.ssrLoadModule('@game/levels.ts');
            sendJson(res, 200, {
              sections: mod.SECTIONS,
              links: mod.LINKS,
              start: mod.START,
            });
            return;
          }
          if (req.method === 'POST') {
            const raw = await readBody(req);
            const data = JSON.parse(raw) as {
              sections: [number, number, number, number, number, number[][]][];
              links: number[][];
              start?: number[];
            };
            if (!Array.isArray(data.sections) || !Array.isArray(data.links)) {
              sendJson(res, 400, { error: 'sections and links arrays required' });
              return;
            }
            const resolved = path.resolve(levelsPath);
            const root = path.resolve(repoRoot);
            const rel = path.relative(root, resolved);
            if (rel.startsWith('..') || path.isAbsolute(rel)) {
              sendJson(res, 400, { error: 'invalid path' });
              return;
            }
            const start = roundStart(data.start);
            const gen = (await server.ssrLoadModule('/src/generateLevels.ts')) as {
              generateLevelsTs: (
                sections: unknown,
                links: unknown,
                start?: number[]
              ) => string;
            };
            let source = gen.generateLevelsTs(data.sections, data.links, start);
            source = ensureStartExport(source, start);
            fs.writeFileSync(resolved, source);
            sendJson(res, 200, { ok: true });
            return;
          }
          next();
        };
        handle().catch(err => {
          sendJson(res, 500, { error: String(err) });
        });
      });
    },
  };
};
