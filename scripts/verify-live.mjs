/** Read-only deployment verification. Failure never changes DNS, routes, code or account settings. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base='https://learning.jiadi.ai';const expected=JSON.parse(fs.readFileSync(path.join(root,'public/site-manifest.json'),'utf8'));
/** Cloudflare's edge injects bot-detection and analytics snippets into HTML responses. They are not part of
 * the deployed build (and this site's CSP blocks them), so remove them before comparing hashes. Nothing else
 * is normalised: any other difference still fails. */
const injected=[/<script>\(function\(\)\{[\s\S]*?__CF\$cv\$params[\s\S]*?<\/script>/g,
 /<script\b[^>]*\bsrc="(?:https:\/\/static\.cloudflareinsights\.com|\/cdn-cgi\/)[^"]*"[^>]*><\/script>/g];
const strip=html=>injected.reduce((s,re)=>s.replace(re,''),html);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
/** A 403/429 means this client was blocked at the edge, which is not evidence about the deployment itself. */
class Blocked extends Error{}
async function get(p){const r=await fetch(base+p,{signal:AbortSignal.timeout(20000),redirect:'follow',cache:'no-store'});
 if(r.status===403||r.status===429)throw new Blocked(`HTTP ${r.status} on ${p}`);return r}
const normalised=[];
try{
 const r=await get('/site-manifest.json');if(!r.ok)throw new Error(`Manifest HTTP ${r.status}`);
 const current=await r.json();if(current.id!==expected.id||current.version!==expected.version)throw new Error('Unexpected site identity/version');
 const home=await get('/');if(!home.ok)throw new Error('Homepage unavailable');const text=await home.text();if(!text.includes('JIADI 学习实验室'))throw new Error('Homepage does not match this project');
 if(!home.headers.get('content-security-policy')?.includes("connect-src 'none'"))throw new Error('Security headers are missing');
 for(const c of expected.courses){const res=await get(`/courses/${c.slug}/`);if(!res.ok)throw new Error(c.slug+' unavailable');
  const html=await res.text();const clean=strip(html);
  if(clean.length!==html.length)normalised.push(`${c.slug}: ${html.length-clean.length} bytes of edge-injected script removed`);
  if(sha(clean)!==c.publishedSha256)throw new Error(c.slug+' content differs from local build'+(clean.length!==html.length?' (after removing edge-injected scripts)':''));
  const d=await get(`/downloads/${c.slug}.html`);if(!d.ok||!d.headers.get('content-disposition')?.includes('attachment'))throw new Error(c.slug+' offline download is not served as an attachment');}
 if((await get('/__learning_lab_missing_page__')).status!==404)throw new Error('Unknown paths must return 404, not the homepage');
 console.log('Verified live at '+base+' — homepage, '+expected.courses.length+' courses, hashes, downloads and 404.');
 if(normalised.length)console.log('Edge normalisation applied (not part of the build):\n  '+normalised.join('\n  '));
}catch(e){
 if(e instanceof Blocked){console.error('INCONCLUSIVE: this client was blocked at the edge ('+e.message+'). Cloudflare bot protection rejects data-centre IPs such as GitHub Actions runners; run this check from a normal network. Not evidence of a broken deployment.');process.exitCode=2}
 else{console.error('NOT VERIFIED: '+e.message);process.exitCode=1}
}
