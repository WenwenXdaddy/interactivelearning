/** Dependency-free, deterministic static-site build. Original course scripts remain unchanged. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'public');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{const f=path.join(out,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const copy=(src,dst)=>{const f=path.join(out,dst);fs.mkdirSync(path.dirname(f),{recursive:true});fs.copyFileSync(path.join(root,src),f)};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
const courses=JSON.parse(read('courses.json'));
if(!Array.isArray(courses)||!courses.length)throw new Error('courses.json must contain at least one course');
const seen=new Set();
for(const c of courses){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)||seen.has(c.slug))throw new Error('Invalid or duplicate course slug');seen.add(c.slug);if(!Array.isArray(c.tags)||!Number.isInteger(c.chapters)||!Number.isInteger(c.terms))throw new Error('Invalid course metadata');}
// Only the generated public directory is recreated. Never operate on content/ or a parent directory.
if(path.basename(out)!=='public'||path.dirname(out)!==root)throw new Error('Unsafe output path');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const filters=[...new Set(courses.map(c=>c.category))].map(x=>`<button class="filter" type="button" data-filter="${escape(x)}" aria-pressed="false">${escape(x)}</button>`).join('');
const cards=courses.map(c=>`<article class="course ${escape(c.tone)}" data-category="${escape(c.category)}" data-search="${escape([c.title,c.subtitle,c.description,c.category,...c.tags].join(' '))}">
<div class="course-visual"><img src="assets/previews/${c.slug}.webp" alt="${escape(c.imageAlt)}" width="1120" height="960" loading="lazy"><span class="course-image-note">课程内实验界面</span></div>
<div class="course-content"><div class="course-kicker"><span class="course-category"><i class="dot" aria-hidden="true"></i>${escape(c.category)}</span><span>${escape(c.version)}</span></div><h3>${escape(c.title)}</h3><p class="subtitle">${escape(c.subtitle)}</p><p class="description">${escape(c.description)}</p><div class="tags">${c.tags.map(t=>`<span class="tag">${escape(t)}</span>`).join('')}</div><div class="course-stats"><span><b>${c.chapters}</b> 个学习站</span><span>${escape(c.metric)}</span><span><b>${c.terms}</b> 个术语</span></div><div class="course-actions"><a class="cta" href="courses/${c.slug}/index.html">进入课程 <span aria-hidden="true">↗</span></a><a class="text-link" href="courses/${c.slug}/study-notes.md" download="${c.slug}-study-notes.md">学习手册 ↓</a><a class="text-link" href="downloads/${c.slug}.html" download="${c.slug}.html">离线 HTML ↓</a></div><p class="course-tip"><strong>建议起点</strong> · ${escape(c.firstTask)}</p></div></article>`).join('\n');
const substitutions={COURSE_COUNT:courses.length,CHAPTER_COUNT:courses.reduce((a,c)=>a+c.chapters,0),TERM_COUNT:courses.reduce((a,c)=>a+c.terms,0),FILTERS:filters,COURSE_CARDS:cards};
const home=read('templates/home.html').replace(/\{\{([A-Z_]+)\}\}/g,(_,k)=>{if(!(k in substitutions))throw new Error('Unknown template token '+k);return substitutions[k]});
write('index.html',home);
const bridgeCSS=`\n/* Portal-only navigation. Original course CSS and JavaScript are retained. */\n.portal-home{display:inline-flex!important;align-items:center;justify-content:center;gap:5px;padding:4px 9px;margin-right:10px;border:1px solid currentColor;border-radius:7px;text-decoration:none;font-family:-apple-system,\"PingFang SC\",sans-serif;font-size:11px!important;font-weight:500;line-height:1.5;min-height:36px;white-space:nowrap;flex-shrink:0;opacity:.85;color:inherit}.portal-home:focus-visible{outline:3px solid currentColor;outline-offset:3px}.portal-home small{font:inherit!important;color:inherit!important;letter-spacing:0!important;display:inline!important}@media(max-width:760px){.portal-home{min-height:40px;min-width:38px;padding:5px;margin-right:4px;font-size:16px!important}.portal-home small{display:none!important}.portal-home~div>small{display:none!important}}@media print{.portal-home{display:none!important}}\n`;
const manifest={id:'jiadi-learning-lab',version:'1.0.0',domain:'learning.jiadi.ai',courseCount:courses.length,courses:[]};
for(const c of courses){
 const source=read(`content/courses/${c.slug}/index.html`);
 if(!source.includes('<div class="brand">')&&!source.includes('<!-- portal-home -->'))throw new Error('Missing original header in '+c.slug);
 if(scripts(source).length===0)throw new Error('Missing course scripts');
 const homeLink='<a class="portal-home" href="../../index.html#courses" aria-label="返回课程首页"><span aria-hidden="true">←</span><small>课程首页</small></a>';
 const portalStyle='<style>.portal-course-nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px;margin-bottom:14px}.portal-course-nav .portal-home{margin:0;font-size:12px!important}.portal-course-nav .portal-home small{display:inline!important}.portal-resources{margin:0;line-height:1.8}.portal-resources a{color:inherit;text-underline-offset:3px}</style>';
 const integrated=source.includes('<!-- portal-home -->')?source.replace('<!-- portal-home -->',portalStyle+'<div class="portal-course-nav">'+homeLink+'<p class="portal-resources"><a href="study-notes.md" download>学习手册 ↓</a> · <a href="../../downloads/'+c.slug+'.html" download>离线 HTML ↓</a></p></div>'):source;
 const course=integrated.replace('</head>',`<meta name="description" content="${escape(c.description)}"><link rel="canonical" href="https://learning.jiadi.ai/courses/${c.slug}/"><link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml"><style>${bridgeCSS}</style>\n</head>`).replace('<div class="brand">','<div class="brand"><a class="portal-home" href="../../index.html#courses" aria-label="返回课程首页"><span aria-hidden="true">←</span><small>课程首页</small></a>');
 if(JSON.stringify(scripts(source))!==JSON.stringify(scripts(course)))throw new Error('Unexpected course script modification');
 write(`courses/${c.slug}/index.html`,course);
 copy(`content/courses/${c.slug}/study-notes.md`,`courses/${c.slug}/study-notes.md`);
 copy(`content/courses/${c.slug}/index.html`,`downloads/${c.slug}.html`);
 copy(`content/previews/${c.slug}.webp`,`assets/previews/${c.slug}.webp`);
 manifest.courses.push({slug:c.slug,title:c.title,version:c.version,chapters:c.chapters,sourceSha256:hash(source),publishedSha256:hash(course),scriptSha256:scripts(source).map(hash)});
}
write('assets/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="17" fill="#245c49"/><text x="32" y="44" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="48" fill="#fffefb">j</text></svg>');
write('404.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>课程暂未找到｜JIADI 学习实验室</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f3ee;color:#20362f;font:16px/1.9 -apple-system,"PingFang SC",sans-serif}main{max-width:580px;padding:35px}small{color:#5e7269;letter-spacing:2px}h1{font-size:34px;line-height:1.4}a{color:#245c49;text-underline-offset:5px}p{color:#5e7269}</style></head><body><main><small>404 / LEARNING LAB</small><h1>这条路径还没有课程。</h1><p>链接可能已经改变，也可能尚未发布。回到目录，选择另一门课程继续探索。</p><a href="/index.html#courses">← 返回课程首页</a></main></body></html>`);
write('robots.txt','User-agent: *\nAllow: /\nDisallow: /downloads/\nSitemap: https://learning.jiadi.ai/sitemap.xml\n');
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://learning.jiadi.ai/</loc></url>${courses.map(c=>`<url><loc>https://learning.jiadi.ai/courses/${c.slug}/</loc></url>`).join('')}</urlset>\n`);
write('site-manifest.json',JSON.stringify(manifest,null,2)+'\n');
// Hash-authorized inline scripts: no unsafe-inline in script-src. Styles remain inline in the supplied courses.
const allScripts=[...scripts(home),...courses.flatMap(c=>scripts(read(`content/courses/${c.slug}/index.html`)))];
const hashes=[...new Set(allScripts.map(s=>`'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`))].join(' ');
write('_headers',`/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self' ${hashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'\n\n/downloads/*\n  Content-Disposition: attachment\n  X-Robots-Tag: noindex\n\n/courses/*/study-notes.md\n  Content-Disposition: attachment\n  X-Robots-Tag: noindex\n\n/site-manifest.json\n  Cache-Control: no-cache\n`);
console.log(`Built ${courses.length} courses for ${manifest.domain}; original course scripts unchanged.`);
