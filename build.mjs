import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
const read = path => readFile(path, 'utf8');
const assets = {
  home: await read('pages/index.html'), community: await read('pages/community.html'),
  css: await read('pages/style.css'), js: await read('pages/form.js'),
  portrait: (await readFile('assets/technoblade.png')).toString('base64'),
  favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="5" fill="#b52f46"/><path d="M6 11l5 4 5-8 5 8 5-4-3 14H9z" fill="#e7c582"/></svg>',
};
await rm('dist', { recursive: true, force: true });
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
await writeFile('dist/server/index.js', 'const ASSETS = ' + JSON.stringify(assets) + ';\n' + await read('worker/backend.js'));
// Hosting configuration is optional for local development.
try {
  await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await cp('drizzle', 'dist/drizzle', { recursive: true });
console.log('Built the two-page site and backend.');
