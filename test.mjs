// Checks the real backend with a temporary SQLite database, never production data.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../dist/server/index.js';
const sqlite = new DatabaseSync(':memory:');
sqlite.exec(readFileSync('drizzle/0000_lovely_microbe.sql', 'utf8'));
const env = { DB: { prepare(sql) { return { bind(...args) { return { async run() { const r = sqlite.prepare(sql).run(...args); return { success: true, meta: { last_row_id: Number(r.lastInsertRowid) } }; } }; } }; } } };
const send = (data, extra = {}) => worker.fetch(new Request('https://test.local/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://test.local', ...extra }, body: JSON.stringify(data) }), env);
for (const path of ['/', '/community', '/style.css', '/form.js', '/portrait', '/favicon.svg']) {
  const r = await worker.fetch(new Request('https://test.local' + path), env);
  assert.equal(r.status, 200, path);
  assert.ok((await r.arrayBuffer()).byteLength > 20, path);
}
assert.equal((await send({ nickname: 'Fan', message: 'The potato war still makes me laugh.' })).status, 201);
assert.equal(sqlite.prepare('SELECT count(*) AS n FROM memories').get().n, 1);
assert.equal(sqlite.prepare('SELECT nickname FROM memories').get().nickname, 'Fan');
for (const data of [null, {}, { nickname: 'x', message: 'short' }, { nickname: 'Fan', message: ' '.repeat(40) }, { nickname: 'Fan', message: 'a'.repeat(1001) }, { nickname: 'Fan', message: 'A meaningful message.', website: 'spam' }]) assert.equal((await send(data)).status, 400);
assert.equal((await send({ nickname: 'Fan', message: 'A meaningful message.' }, { Origin: 'https://other.local' })).status, 403);
assert.equal(sqlite.prepare('SELECT count(*) AS n FROM memories').get().n, 1);
const literal = "Nice video'); DROP TABLE memories; --";
assert.equal((await send({ nickname: 'Tester', message: literal })).status, 201);
assert.equal(sqlite.prepare('SELECT message FROM memories WHERE id=2').get().message, literal);
assert.equal((await worker.fetch(new Request('https://test.local/api/memories'), env)).status, 405);
assert.equal((await worker.fetch(new Request('https://test.local/missing'), env)).status, 404);
const unavailable = await worker.fetch(new Request('https://test.local/api/memories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({nickname:'Fan',message:'A meaningful message.'}) }), {});
assert.equal(unavailable.status, 503);
sqlite.close();
console.log('PASS: both pages/assets, saved row read-back, validation, cross-origin rejection, SQL-safe input, private records, 404 and storage failure.');
