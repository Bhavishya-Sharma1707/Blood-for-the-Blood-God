// This is the backend: it runs on the server, not in a visitor's browser.
// The build script puts our HTML, CSS, and image into the same deployable file.
const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Content-Security-Policy': "default-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'" };
function reply(body, status = 200, type = 'text/html; charset=utf-8') {
  return new Response(body, { status, headers: { ...headers, 'Content-Type': type, 'Cache-Control': 'no-store' } });
}
function json(data, status = 200) { return reply(JSON.stringify(data), status, 'application/json; charset=utf-8'); }
// A helper keeps database-specific code in one place. Values use placeholders.
async function saveMemory(db, nickname, message) {
  if (!db) throw new Error('Database binding unavailable');
  const result = await db.prepare('INSERT INTO memories (nickname, message, created_at) VALUES (?, ?, ?)')
    .bind(nickname, message, new Date().toISOString()).run();
  if (!result.success) throw new Error('Database insert failed');
  return result.meta.last_row_id;
}
async function receiveMemory(request, env) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Please send the form from this website.' }, 403);
  if (Number(request.headers.get('Content-Length') || 0) > 12000) return json({ error: 'Message is too large.' }, 413);
  let data;
  try {
    const body = await request.text();
    if (body.length > 12000) return json({ error: 'Message is too large.' }, 413);
    data = request.headers.get('Content-Type')?.includes('application/json') ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body));
  } catch { return json({ error: 'Could not read your message. Please try again.' }, 400); }
  if (!data || typeof data.nickname !== 'string' || typeof data.message !== 'string') return json({ error: 'Please enter a nickname and memory.' }, 400);
  const nickname = data.nickname.trim();
  const message = data.message.trim();
  if (data.website) return json({ error: 'Unable to accept this submission.' }, 400);
  if (nickname.length < 2 || nickname.length > 40 || message.length < 10 || message.length > 1000) return json({ error: 'Use a nickname of 2–40 characters and a memory of 10–1,000 characters.' }, 400);
  try {
    const id = await saveMemory(env.DB, nickname, message);
    if (!request.headers.get('Content-Type')?.includes('application/json')) {
      return reply('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Memory saved</title><link rel="stylesheet" href="/style.css"><main class="container community"><section><h1>Memory saved.</h1><p>Thank you for sharing it.</p><a href="/community">Return to the form</a></section></main></html>', 201);
    }
    return json({ saved: true, id }, 201);
  } catch (error) {
    console.error('Memory storage failed:', error.message);
    return json({ error: 'We could not save your message. Please keep it and try again shortly.' }, 503);
  }
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/memories') {
      if (request.method !== 'POST') return json({ error: 'This endpoint only accepts new messages.' }, 405);
      return receiveMemory(request, env);
    }
    if (!['GET', 'HEAD'].includes(request.method)) return reply('Method not allowed', 405, 'text/plain');
    const routes = { '/': ['home', 'text/html; charset=utf-8'], '/community': ['community', 'text/html; charset=utf-8'], '/style.css': ['css', 'text/css'], '/form.js': ['js', 'text/javascript'], '/favicon.svg': ['favicon', 'image/svg+xml'] };
    if (path === '/portrait') return reply(request.method === 'HEAD' ? null : Uint8Array.from(atob(ASSETS.portrait), c => c.charCodeAt(0)), 200, 'image/png');
    if (routes[path]) return reply(request.method === 'HEAD' ? null : ASSETS[routes[path][0]], 200, routes[path][1]);
    return reply('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found</title><link rel="stylesheet" href="/style.css"><main class="container community"><section><h1>Page not found.</h1><p>This page does not exist.</p><a href="/">Back to the tribute</a></section></main></html>', 404);
  },
};
