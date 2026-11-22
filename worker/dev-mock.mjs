// Run the real Worker code locally in Node, with a FAKE Gumroad and an in-memory KV.
// For testing the unlock flow only. Never talks to the real Gumroad.
//   python3 src/export_games.py && node worker/dev-mock.mjs        (listens on http://localhost:8787)
// Fake codes: VALID-1111-2222-3333 (works), REFUND-1111-2222-3333, FULL-1111-2222-3333, anything else = not found.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from './index.js';
import { fakeGumroad, memoryKV, env as mkEnv } from './test/mocks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const rows = JSON.parse(fs.readFileSync(path.join(here, '.games', 'paid-games.json'), 'utf8'));
const g = fakeGumroad();
globalThis.fetch = g.fetchStub; // the Worker's only outgoing call is to Gumroad
const env = mkEnv(memoryKV(rows));
const PORT = Number(process.env.PORT || 8787);

http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request('http://localhost:' + PORT + req.url, {
    method: req.method, headers: req.headers, body: req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS' ? undefined : body,
  }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
  console.log(req.method, req.url, r.status);
}).listen(PORT, () => console.log('mock unlock Worker on http://localhost:' + PORT, '(' + rows.length + ' paid games in KV)'));
