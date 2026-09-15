/** Read-only deployment verification. Failure never changes DNS, routes, code or account settings. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base='https://learning.jiadi.ai';const expected=JSON.parse(fs.readFileSync(path.join(root,'public/site-manifest.json'),'utf8'));
async function get(p){return fetch(base+p,{signal:AbortSignal.timeout(20000),redirect:'follow',cache:'no-store'})}
try{
 const r=await get('/site-manifest.json');if(!r.ok)throw new Error(`Manifest HTTP ${r.status}`);
 const current=await r.json();if(current.id!==expected.id||current.version!==expected.version)throw new Error('Unexpected site identity/version');
 const home=await get('/');if(!home.ok)throw new Error('Homepage unavailable');const text=await home.text();if(!text.includes('JIADI 学习实验室'))throw new Error('Homepage does not match this project');
 if(!home.headers.get('content-security-policy')?.includes("connect-src 'none'"))throw new Error('Security headers are missing');
 for(const c of expected.courses){const res=await get(`/courses/${c.slug}/`);if(!res.ok)throw new Error(c.slug+' unavailable');const html=await res.text();if(crypto.createHash('sha256').update(html).digest('hex')!==c.publishedSha256)throw new Error(c.slug+' content differs from local build');const d=await get(`/downloads/${c.slug}.html`);if(!d.ok||!d.headers.get('content-disposition')?.includes('attachment'))throw new Error(c.slug+' offline download is not served as an attachment');}
 if((await get('/__learning_lab_missing_page__')).status!==404)throw new Error('Unknown paths must return 404, not the homepage');
 console.log('Verified live at '+base+' — homepage, both courses, hashes, downloads and 404.');
}catch(e){console.error('NOT VERIFIED: '+e.message);process.exitCode=1}
