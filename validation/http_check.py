"""Checks the real local Node static server via HTTP; not Cloudflare/Wrangler or browser navigation."""
from pathlib import Path
import subprocess,time,urllib.request,urllib.error,json,hashlib
root=Path(__file__).resolve().parents[1];server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE);checks=[]
def get(path,method='GET'):
 try:r=urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:4173'+path,method=method),timeout=5)
 except urllib.error.HTTPError as e:r=e
 return r.status,dict(r.headers),r.read()
def check(name,ok):
 checks.append({'name':name,'passed':bool(ok)});print('PASS'if ok else'FAIL',name)
try:
 for _ in range(40):
  try:get('/');break
  except Exception:time.sleep(.1)
 status,h,b=get('/');check('homepage serves HTTP 200',status==200);check('homepage uses CSP with no outbound connections',"connect-src 'none'"in h.get('Content-Security-Policy',''));check('homepage anti-frame header',h.get('X-Frame-Options')=='DENY')
 for slug in ['gold-volatility','unknown-unknowable']:
  st,hh,bb=get('/courses/'+slug+'/');check(slug+' content matches build bytes',st==200 and bb==(root/'public/courses'/slug/'index.html').read_bytes())
  st,hh,bb=get('/downloads/'+slug+'.html');check(slug+' unchanged source download',st==200 and bb==(root/'content/courses'/slug/'index.html').read_bytes());check(slug+' HTML attachment header',hh.get('Content-Disposition')=='attachment')
  st,hh,bb=get('/courses/'+slug+'/study-notes.md');check(slug+' notes attachment header',st==200 and hh.get('Content-Disposition')=='attachment')
 check('unknown page is a real 404',get('/not-a-course')[0]==404);check('HEAD has no response body',get('/',method='HEAD')[2]==b'');check('private build header configuration is not served',get('/_headers')[0]==404);check('non-GET method is rejected',get('/',method='POST')[0]==405)
finally:server.terminate();server.wait(timeout=5)
(root/'validation/http-results.json').write_text(json.dumps({'scope':'local Node server, not Cloudflare','checks':checks},indent=2))
if not all(x['passed']for x in checks):raise SystemExit(1)
