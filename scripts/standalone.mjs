import { readFile, writeFile, mkdir } from 'node:fs/promises';
const html = await readFile('dist/index.html', 'utf8');
const scriptPath = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const cssPath = html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if (!scriptPath || !cssPath) throw new Error('The build has no script or stylesheet entry.');
const js = await readFile('dist' + scriptPath, 'utf8');
let css = await readFile('dist' + cssPath, 'utf8');
for (const name of ['serif', 'serif-italic', 'sans']) {
 const font = await readFile(`public/fonts/${name}.ttf`);
 css = css.replaceAll(`/fonts/${name}.ttf`, `data:font/ttf;base64,${font.toString('base64')}`);
}
const favicon = await readFile('public/favicon.svg','utf8');
const output = html
 .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, () => `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`)
 .replace(/<link[^>]+href="[^"]+\.css"[^>]*>/, () => `<style>${css}</style>`)
 .replace('href="/favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`)
 .replace('href="/" aria-label="EverMemory home"', 'href="#" aria-label="EverMemory home"');
await mkdir('outputs', {recursive:true});
await writeFile('outputs/evermemory.html',output);
console.log(`Standalone HTML: outputs/evermemory.html (${Math.round(Buffer.byteLength(output)/1024)} KiB)`);
