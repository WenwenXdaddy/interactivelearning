/** Read-only local HTTP acceptance; run after the integrated build and preview server start. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.argv[2]||'http://127.0.0.1:4186';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Local acceptance only');
const courses=JSON.parse(fs.readFileSync(path.join(root,'courses.json'),'utf8'));
let checked=0;
async function get(url,type){const response=await fetch(new URL(url,base));assert.equal(response.status,200,url);if(type)assert.match(response.headers.get('content-type')||'',type,url);checked++;return response;}
const home=await get('/',/text\/html/);
const policy=home.headers.get('content-security-policy')||'';
assert.match(policy,/connect-src 'self'(?:;|$)/);assert.match(policy,/worker-src 'self'(?:;|$)/);
assert(!/script-src[^;]*unsafe-inline/.test(policy));
assert.match(policy,/frame-ancestors 'none'/);
const html=await home.text();
for(const [,asset]of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const url=new URL(asset,base);if(url.origin!==new URL(base).origin)continue;
 if(/\.(js|css|png|svg|webmanifest)$/.test(url.pathname)){
  const type=url.pathname.endsWith('.js')?/javascript/:url.pathname.endsWith('.css')?/text\/css/:url.pathname.endsWith('.png')?/image\/png/:url.pathname.endsWith('.svg')?/image\/svg/:/json|manifest/;
  await get(url.href,type);
 }
}
const manifestResponse=await get('/manifest.webmanifest',/json|manifest/);
const manifest=await manifestResponse.json();
assert.equal(manifest.scope,'/');assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons){await get(icon.src,/image\/(png|svg)/);}
await get('/sw.js',/javascript/);
for(const c of courses){
 const response=await get(`/courses/${c.slug}/`,/text\/html/);
 const published=await response.text();
 const local=fs.readFileSync(path.join(root,'public/courses',c.slug,'index.html'),'utf8');
 assert.equal(published,local,c.slug+' served generated body');
 const download=await get(`/downloads/${c.slug}.html`,/text\/html/);
 assert.match(download.headers.get('content-disposition')||'',/attachment/);
 assert.deepEqual(Buffer.from(await download.arrayBuffer()),fs.readFileSync(path.join(root,'content/courses',c.slug,'index.html')));
 const notes=await get(`/courses/${c.slug}/study-notes.md`,/text\/markdown/);
 assert.match(notes.headers.get('content-disposition')||'',/attachment/);
}
const absent=await fetch(new URL('/not-a-course-acceptance/',base));assert.equal(absent.status,404);
console.log(JSON.stringify({status:'passed',httpResponsesChecked:checked,courses:courses.length,csp:'same-origin only',downloads:'source bytes preserved',missingRoute:404},null,2));
