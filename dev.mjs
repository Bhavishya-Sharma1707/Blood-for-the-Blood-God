// Optional local server for learning. Requires Node.js 24 or newer.
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import worker from '../dist/server/index.js';
mkdirSync('.local', { recursive: true });
const db = new DatabaseSync('.local/memories.sqlite');
// Local development setup only; production tables are created by migrations.
const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='memories'").get();
if (!exists) db.exec(readFileSync('drizzle/0000_lovely_microbe.sql', 'utf8'));
const env = { DB: { prepare(sql) { return { bind(...args) { return { async run() { const result = db.prepare(sql).run(...args); return { success:true, meta:{ last_row_id: Number(result.lastInsertRowid) } }; } }; } }; } } };
http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const request = new Request('http://localhost:3000' + req.url, { method:req.method, headers:req.headers, ...(body.length ? {body} : {}) });
    const response = await worker.fetch(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error(error); res.writeHead(500);res.end('Local server error'); }
}).listen(3000, '127.0.0.1', () => console.log('Open http://localhost:3000 — Ctrl+C to stop.'));
