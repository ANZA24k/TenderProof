import { cp, mkdir, readdir, readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const source = new URL('site/', root);
await mkdir(new URL('dist/', root), { recursive: true });
for (const name of await readdir(source)) {
  await cp(new URL(name, source), new URL(`dist/${name}`, root), { recursive: true });
}
const html = await readFile(new URL('dist/index.html', root), 'utf8');
if (!html.includes('data-connect') || !html.includes('wallet-ui.js')) throw new Error('Wallet UI missing');
console.log('Built static website with wallet controls.');
