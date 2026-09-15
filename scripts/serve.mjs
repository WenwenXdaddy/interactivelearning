/** Local static HTTP server with CSP headers and common directory/404 behavior. Not a Cloudflare emulator. */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const args=process.argv.slice(2);const pi=args.indexOf('--port');const port=Number(pi>=0?args[pi+1]:process.env.PORT||4173);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid port');
const mime={'.html':'text/html; charset=utf-8','.md':'text/markdown; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const lines=fs.readFileSync(path.join(root,'_headers'),'utf8').split(/\r?\n/);const rules=[];let rule;
for(const line of lines){if(!line.trim())continue;if(!/^\s/.test(line)){rule={pattern:line.trim(),headers:{}};rules.push(rule)}else if(rule){const i=line.indexOf(':');if(i>0)rule.headers[line.slice(0,i).trim()]=line.slice(i+1).trim()}}
const match=(pat,p)=>new RegExp('^'+pat.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$').test(p);
http.createServer((req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return}
 const url=new URL(req.url,'http://localhost');let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
 if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(x=>x.startsWith('.'))||['/_headers','/_redirects'].includes(pathname)){res.writeHead(404);res.end('Not found');return}
 const local=path.resolve(root,'.'+pathname);if(local!==root&&!local.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 let filename=local;let code=200;
 if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory()){
  if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'+url.search});res.end();return}
  filename=path.join(filename,'index.html');
 }
 if(!fs.existsSync(filename)||!fs.statSync(filename).isFile()){filename=path.join(root,'404.html');code=404}
 const headers={'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'};
 for(const r of rules)if(match(r.pattern,pathname))Object.assign(headers,r.headers);
 const buf=fs.readFileSync(filename);headers['Content-Length']=buf.length;res.writeHead(code,headers);if(req.method==='HEAD')res.end();else res.end(buf);
 }catch(err){console.error(err.message);if(!res.headersSent)res.writeHead(500);res.end('Server error')}
}).listen(port,'127.0.0.1',()=>console.log(`Learning Lab preview: http://127.0.0.1:${port}`));
