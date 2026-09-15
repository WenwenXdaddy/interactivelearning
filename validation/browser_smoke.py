"""Offline DOM/browser checks. Explicitly NOT native HTTP, DNS or native-storage verification.
In the sandbox browser, HTTP navigation is policy-blocked. Supplied HTML is set into
about:blank, local images are embedded for rendering, and storage is an in-memory shim.
"""
from pathlib import Path
import base64, json, re, os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];out=root/'validation/screens';out.mkdir(parents=True,exist_ok=True)
records=[];errors=[]
def check(name,fn):
 try:
  result=fn();assert result is not False
  records.append({'name':name,'status':'passed'});print('PASS',name)
 except Exception as e:
  records.append({'name':name,'status':'failed','error':str(e)});print('FAIL',name,str(e)[:250])
def storage(p):return p.evaluate('Object.assign({}, window.__qaStorage)')
def inject_storage(p,values=None):
 p.evaluate('''initial=>{window.__qaStorage={...initial};const s={getItem:k=>Object.hasOwn(window.__qaStorage,k)?window.__qaStorage[k]:null,setItem:(k,v)=>{window.__qaStorage[k]=String(v)},removeItem:k=>{delete window.__qaStorage[k]},clear:()=>{window.__qaStorage={}},key:i=>Object.keys(window.__qaStorage)[i]??null,get length(){return Object.keys(window.__qaStorage).length}};Object.defineProperty(window,'localStorage',{value:s,configurable:true});}''', values or {})
def html_for(path):
 text=path.read_text()
 for m in list(re.finditer(r'<img\b[^>]*src="([^"]+)"',text)):
  src=m.group(1);p=(path.parent/src).resolve()
  if p.exists():text=text.replace('src="'+src+'"','src="data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode()+'"')
 text=re.sub(r'<link\b[^>]*rel="icon"[^>]*>','',text)
 if path.is_relative_to(root/'public'):
  policy=(root/'public/_headers').read_text().split('Content-Security-Policy: ',1)[1].split('\n')[0].replace("; frame-ancestors 'none'",'')
  # frame-ancestors is HTTP-header-only. The remaining policy is tested as meta here.
  text=text.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+policy.replace('"','&quot;')+'">',1)
 return text
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('BROWSER_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1040},color_scheme='light',accept_downloads=True)
 def page(path,store=None):
  p=context.new_page();p.set_default_timeout(4000);p.on('pageerror',lambda e:errors.append(str(e)));inject_storage(p,store);p.set_content(html_for(path),wait_until='load');return p
 home=page(root/'public/index.html')
 check('home: two courses visible',lambda:home.locator('.course:visible').count()==2)
 check('home: filter controls initialized',lambda:home.locator('#catalogTools').is_visible())
 home.locator('[data-filter="策略与风险"]').click();check('home: topic filtering',lambda:home.locator('.course:visible').count()==1)
 home.locator('[data-filter="all"]').click();home.locator('#search').fill('逆向选择');check('home: keyword search',lambda:home.locator('.course:visible h3').inner_text()=='未知投资实验室')
 home.locator('#search').fill('xxxxxxx');check('home: no-results feedback',lambda:home.locator('#emptyState').is_visible())
 home.locator('#search').fill('');home.locator('#search').evaluate('e=>e.blur()');home.screenshot(path=str(out/'desktop-home.png'),full_page=True)
 home.locator('#themeBtn').click();check('home: dark theme',lambda:'dark'in(home.locator('body').get_attribute('class')or''));home.screenshot(path=str(out/'desktop-home-dark.png'),full_page=True)
 h2=page(root/'public/index.html',storage(home));check('home: theme restored using simulated storage',lambda:'dark'in(h2.locator('body').get_attribute('class')or''));h2.close()
 home.locator('#themeBtn').click()
 for w in [390,360]:
  home.set_viewport_size({'width':w,'height':844});check(f'home: no horizontal overflow at {w}px',lambda:home.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  if w==390:home.screenshot(path=str(out/'mobile-home.png'),full_page=True)
 # Default model output regression against retained originals.
 gold0=page(root/'content/courses/gold-volatility/index.html');gold=page(root/'public/courses/gold-volatility/index.html')
 metric_ids=['labCorePL','labOverlayPL','labTotalPL','netCarry','requiredPremium','vrpGap']
 for id in metric_ids:check('gold: default regression '+id,lambda id=id:gold.locator('#'+id).inner_text()==gold0.locator('#'+id).inner_text())
 check('gold: all ten chapters retained',lambda:gold.locator('#nav button').count()==10)
 gold.locator('#nav [data-go="3"]').click();before=gold.locator('#labTotalPL').inner_text()
 gold.locator('#labQ').evaluate("e=>{e.value='0';e.dispatchEvent(new Event('input',{bubbles:true}))}")
 check('gold: zero overlay equals core',lambda:gold.locator('#labTotalPL').inner_text()==gold.locator('#labCorePL').inner_text())
 check('gold: slider changes numerical output',lambda:gold.locator('#labTotalPL').inner_text()!=before)
 gold.locator('#labQ').evaluate("e=>{e.value='30';e.dispatchEvent(new Event('input',{bubbles:true}))}")
 gold.locator('#glossaryBtn').click();check('gold: glossary opens',lambda:gold.locator('#glossaryDialog').get_attribute('open')is not None)
 gold.locator('#glossaryDialog input').first.fill('gamma');check('gold: glossary search returns results',lambda:gold.locator('#glossaryDialog .term-result').count()>0)
 gold.locator('#glossaryClose').focus();gold.keyboard.press('Escape');gold.wait_for_function("!document.getElementById('glossaryDialog').open");check('gold: Escape outside search closes glossary',lambda:gold.locator('#glossaryDialog').get_attribute('open')is None)
 gold.locator('#nav [data-go="9"]').click();gold.locator('[data-q="0"]').first.click();check('gold: quiz answer saved in own namespace',lambda:'au-lab-quiz'in storage(gold))
 with gold.expect_download() as d:gold.locator('#exportBtn').click()
 dl=d.value;dl.save_as(str(root/'validation/gold-export.md'));check('gold: real Blob Markdown download',lambda:(root/'validation/gold-export.md').stat().st_size>1000)
 gs=storage(gold);greload=page(root/'public/courses/gold-volatility/index.html',gs);check('gold: seen/quiz restored using simulated storage',lambda:storage(greload).get('au-lab-quiz')==gs.get('au-lab-quiz'));greload.close()
 gold.locator('#nav [data-go="0"]').click();gold.set_viewport_size({'width':390,'height':844});gold.screenshot(path=str(out/'gold-mobile.png'),full_page=False)
 check('gold: mobile header and home link visible',lambda:gold.locator('.portal-home').is_visible())
 check('gold: no horizontal overflow at 390px',lambda:gold.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 uu0=page(root/'content/courses/unknown-unknowable/index.html');uu=page(root/'public/courses/unknown-unknowable/index.html')
 results0=uu0.evaluate('LearningLab.getResults()');results=uu.evaluate('LearningLab.getResults()')
 for name in results:check('unknown: default model regression '+name,lambda name=name:results[name]==results0[name])
 check('unknown: all nine chapters retained',lambda:uu.locator('#nav button').count()==9)
 uu.evaluate('LearningLab.showLesson(3)');before=uu.evaluate('LearningLab.getResults().selection')
 uu.locator('#selection_bid').evaluate("e=>{e.value='80';e.dispatchEvent(new Event('input',{bubbles:true}))}")
 check('unknown: selection output responds to bid',lambda:uu.evaluate('LearningLab.getResults().selection')!=before)
 check('unknown: model input reaches saved state',lambda:uu.evaluate('LearningLab.getState().models.selection.bid')==80)
 store=storage(uu);uu2=page(root/'public/courses/unknown-unknowable/index.html',store)
 check('unknown: parameters restored using simulated storage',lambda:uu2.evaluate('LearningLab.getState().models.selection.bid')==80);uu2.close()
 uu.locator('#glossaryBtn').click();check('unknown: glossary opens',lambda:uu.locator('#glossaryDialog').get_attribute('open')is not None)
 uu.locator('#glossaryDialog input').first.fill('逆向选择');check('unknown: glossary search works',lambda:uu.locator('#glossaryDialog .term-result').count()>0)
 uu.keyboard.press('Escape');uu.wait_for_function("!document.getElementById('glossaryDialog').open");check('unknown: Escape closes glossary',lambda:uu.locator('#glossaryDialog').get_attribute('open')is None)
 with uu.expect_download() as d:uu.locator('#exportBtn').click()
 dl=d.value;dl.save_as(str(root/'validation/unknown-export.md'));check('unknown: real Blob Markdown download',lambda:(root/'validation/unknown-export.md').stat().st_size>1000)
 shared=storage(gold)|storage(uu);uu3=page(root/'public/courses/unknown-unknowable/index.html',shared)
 check('courses: unknown course load does not alter gold keys',lambda:all(storage(uu3).get(k)==v for k,v in storage(gold).items()));uu3.close()
 uu.evaluate('LearningLab.showLesson(0)');uu.set_viewport_size({'width':390,'height':844});uu.screenshot(path=str(out/'unknown-mobile.png'),full_page=False)
 check('unknown: mobile home link visible',lambda:uu.locator('.portal-home').is_visible())
 check('unknown: no horizontal overflow at 390px',lambda:uu.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 for p,name in [(gold,'gold'),(uu,'unknown')]:
  p.set_viewport_size({'width':360,'height':800});check(name+': no horizontal overflow at 360px',lambda p=p:p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 check('all pages: no JavaScript exceptions',lambda:not errors)
 browser.close()
report={'mode':'offline DOM with in-memory storage shim; NOT real HTTP navigation or native localStorage','browser':'system Chromium via Playwright','checks':records,'pageErrors':errors,'passed':sum(x['status']=='passed'for x in records),'failed':sum(x['status']=='failed'for x in records)}
(root/'validation/browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({k:report[k]for k in['passed','failed','pageErrors']},ensure_ascii=False))
if report['failed']:raise SystemExit(1)
