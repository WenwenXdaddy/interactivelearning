"""Snapshot and browser checks for the seven-course source TOC upgrade."""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path
from playwright.sync_api import Page, sync_playwright
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
SLUGS="muscle-health-lyon cognitive-flexibility-langer reclaim-your-brain overcome-inner-resistance healthy-masculinity language-learning-science why-learning-tools-fail".split()
SCREENSHOTS={"muscle-health-lyon","cognitive-flexibility-langer"}

def norm(text:str)->str:return re.sub(r"\s+"," ",text).strip()
def sha(text:str)->str:return hashlib.sha256(text.encode()).hexdigest()
def allowed(text:str)->str:
 text=re.sub(r"(\d+) \u4e2a\u63a8\u7406\u5355\u5143",lambda match:match.group(1)+" \u7ad9",text)
 return text.replace("\u5173\u952e\u627f\u91cd\u4e3b\u5f20","\u5173\u952e\u4e3b\u5f20").replace("\u627f\u91cd\u4e3b\u5f20","\u5173\u952e\u4e3b\u5f20").replace("\u627f\u91cd\u70b9","\u8981\u70b9")
def source_text(page:Page)->str:
 sel="#source-text" if page.locator("#source-text").count() else ".source-document"
 return norm(page.locator(sel).text_content())
def lessons(page:Page)->list[dict]:
 loc=page.locator("[data-lesson]");rows=[]
 for i in range(loc.count()):
  el=loc.nth(i);text=norm(el.text_content());rows.append({"lesson":el.get_attribute("data-lesson") or str(i),"id":el.get_attribute("id") or "","text":text,"sha256":sha(text)})
 return rows
def open_course(page:Page,slug:str)->None:
 page.goto((ROOT/"content"/"courses"/slug/"index.html").as_uri(),wait_until="load");page.wait_for_timeout(100)
def snapshot(path:Path)->None:
 result={"courses":{}}
 for slug in SLUGS:
  text=(ROOT/"content"/"courses"/slug/"index.html").read_text(encoding="utf-8");soup=BeautifulSoup(text,"html.parser");rows=[]
  for i,el in enumerate(soup.select("[data-lesson]")):
   body=norm(el.get_text(" ",strip=True));rows.append({"lesson":el.get("data-lesson",str(i)),"id":el.get("id","") ,"text":body,"sha256":sha(body)})
  source=soup.select_one("#source-text") or soup.select_one(".source-document");src=norm(source.get_text(" ",strip=True))
  result["courses"][slug]={"file_sha256":sha(text),"lessons":rows,"source_text":src,"source_sha256":sha(src)}
  print(f"SNAPSHOT {slug}: {len(rows)} lessons, source {sha(src)[:12]}")
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8",newline="\n")

def static_verify(before_path:Path,out:Path)->None:
 before=json.loads(before_path.read_text(encoding="utf-8"))["courses"];rows=[];failures=[]
 def check(slug,name,condition,detail=""):
  rows.append({"course":slug,"check":name,"status":"passed" if condition else "failed","detail":detail})
  if not condition:failures.append(f"{slug}: {name}: {detail}")
 for slug in SLUGS:
  path=ROOT/"content"/"courses"/slug/"index.html";raw=path.read_bytes();text=raw.decode("utf-8");soup=BeautifulSoup(text,"html.parser");nodes=soup.select("[data-lesson]");old=before[slug]["lessons"]
  check(slug,"lesson count unchanged",len(nodes)==len(old))
  for previous,current in zip(old[:-1],nodes[:-1],strict=True):check(slug,f"station {previous['lesson']} text allowlist",allowed(previous["text"])==norm(current.get_text(" ",strip=True)))
  source=soup.select_one("#source-text") or soup.select_one(".source-document");check(slug,"verbatim source hash",sha(norm(source.get_text(" ",strip=True)))==before[slug]["source_sha256"])
  check(slug,"single source TOC and back button",len(soup.select("#source-toc"))==1 and len(soup.select("#source-back"))==1)
  check(slug,"responsive source layout contract",all(token in text for token in ("grid-template-columns:minmax(0,1fr) 230px","position:sticky","max-height:calc(100dvh - 130px)","overflow-y:auto","flex-wrap:nowrap","@media(max-width:600px){.source-side{top:0}")))
  check(slug,"history and scroll-spy contract",all(token in text for token in ("srcHistory.length>20","requestAnimationFrame","addEventListener('scroll'","scrollLeft=changed.offsetLeft","scrollTop=changed.offsetTop")))
  check(slug,"UTF-8 no BOM and LF",not raw.startswith(bytes((0xef,0xbb,0xbf))) and b"\r\n" not in raw)
 report={"mode":"static DOM/text/CSS/JavaScript contract; not a browser runtime test","passed":sum(x["status"]=="passed" for x in rows),"failed":len(failures),"checks":rows,"failures":failures};out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8",newline="\n");print(json.dumps({"passed":report["passed"],"failed":report["failed"]},ensure_ascii=False))
 if failures:raise SystemExit(1)

def passed(records:list[dict],slug:str,name:str,condition:bool,detail:str="")->None:
 if not condition:raise AssertionError(f"{slug}: {name}{': '+detail if detail else ''}")
 records.append({"course":slug,"check":name,"status":"passed"});print(f"PASS {slug}: {name}")
def show(page:Page,n:int)->None:
 page.evaluate("""n=>{if(typeof window.showLesson==='function')window.showLesson(n,false);else if(typeof window.show==='function')window.show(n,false);else throw Error('course navigation function not found')}""",n);page.wait_for_timeout(50)
def check_course(page:Page,slug:str,before:dict,shots:Path,records:list[dict])->None:
 errors=[];page.on("pageerror",lambda error:errors.append(str(error)));open_course(page,slug)
 current=lessons(page);old=before["lessons"];passed(records,slug,"lesson count unchanged",len(current)==len(old))
 for a,b in zip(old[:-1],current[:-1],strict=True):
  expected=allowed(a["text"]);passed(records,slug,f"station {a['lesson']} text changed only by allowed wording",expected==b["text"],f"expected {sha(expected)[:12]}, got {b['sha256'][:12]}")
 src=source_text(page);passed(records,slug,"verbatim source text unchanged",sha(src)==before["source_sha256"]);passed(records,slug,"one source TOC",page.locator("#source-toc").count()==1)
 source_n=page.locator("[data-lesson]").count()-1;trigger=page.locator("[data-source-line], .to-source").first
 origin=int(trigger.locator("xpath=ancestor::*[@data-lesson][1]").get_attribute("data-lesson"));show(page,origin);trigger.scroll_into_view_if_needed();page.evaluate("scrollBy(0,-120)");origin_y=page.evaluate("scrollY");trigger.click();page.wait_for_timeout(150)
 passed(records,slug,"comparison jump reaches source station",not page.locator(f'[data-lesson="{source_n}"]').is_hidden());passed(records,slug,"back button appears after comparison jump",page.locator("#source-back").is_visible());passed(records,slug,"exactly one active source chapter",page.locator("#source-toc .active").count()==1)
 toc_count=page.locator("#source-toc [data-src]").count();heading_count=page.locator("#source-text h3, #source-text h4, .source-document h3, .source-document h4").count();passed(records,slug,"TOC covers all source chapters",toc_count==(heading_count or toc_count) and toc_count>0)
 page.locator("#source-back").click();page.wait_for_timeout(100);passed(records,slug,"back returns to prior station",not page.locator(f'[data-lesson="{origin}"]').is_hidden());passed(records,slug,"back restores prior scroll",abs(page.evaluate("scrollY")-origin_y)<=2)
 trigger.click();page.wait_for_timeout(100);source_y=page.evaluate("scrollY");target=page.locator("#source-toc [data-src]").nth(min(1,toc_count-1));target.click();page.wait_for_timeout(150);passed(records,slug,"TOC click leaves one active chapter",page.locator("#source-toc .active").count()==1);passed(records,slug,"clicked TOC chapter is active","active" in (target.get_attribute("class") or "").split())
 active_visible=target.evaluate("""el=>{const toc=document.querySelector('#source-toc'),r=el.getBoundingClientRect();if(toc.scrollWidth>toc.clientWidth+1){const t=toc.getBoundingClientRect();return r.left>=t.left-1&&r.right<=t.right+1}const b=document.querySelector('.source-side-sticky').getBoundingClientRect();return r.top>=b.top-1&&r.bottom<=b.bottom+1}""");passed(records,slug,"active chapter stays visible in TOC",active_visible)
 page.locator("#source-back").click();page.wait_for_timeout(100);passed(records,slug,"history steps back within source",abs(page.evaluate("scrollY")-source_y)<=2);page.locator("#source-back").click();page.wait_for_timeout(100);passed(records,slug,"history steps back to originating station",not page.locator(f'[data-lesson="{origin}"]').is_hidden());passed(records,slug,"back button hides when history is empty",page.locator("#source-back").is_hidden())

 trigger.click();page.wait_for_timeout(100);page.set_viewport_size({"width":1280,"height":720});page.evaluate("scrollTo(0,500)");page.wait_for_timeout(100)
 desktop=page.locator(".source-side-sticky").evaluate("el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {position:s.position,top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight}}")
 passed(records,slug,"desktop source TOC is sticky",desktop["position"]=="sticky");passed(records,slug,"1280x720 TOC bottom stays in viewport",desktop["bottom"]<=desktop["viewport"]+1,json.dumps(desktop))
 for width,height in ((1440,900),(390,844),(360,800)):
  page.set_viewport_size({"width":width,"height":height});page.evaluate("scrollTo(0,400)");page.wait_for_timeout(100);overflow=page.evaluate("document.documentElement.scrollWidth-innerWidth");passed(records,slug,f"no horizontal overflow at {width}px",overflow<=1,f"overflow={overflow}")
  if width<=600:
   mobile=page.locator(".source-side").evaluate("el=>({position:getComputedStyle(el).position,top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height,viewport:innerHeight,wrap:getComputedStyle(document.querySelector('#source-toc')).flexWrap})")
   passed(records,slug,f"mobile TOC is sticky at top at {width}px",mobile["position"]=="sticky" and abs(mobile["top"])<=1,json.dumps(mobile));passed(records,slug,f"mobile TOC does not wrap at {width}px",mobile["wrap"]=="nowrap");passed(records,slug,f"mobile TOC remains compact at {width}px",mobile["height"]<mobile["viewport"]/2,json.dumps(mobile))
  if slug in SCREENSHOTS and width in (1440,390):
   shots.mkdir(parents=True,exist_ok=True);page.screenshot(path=str(shots/f"{slug}-{'desktop' if width==1440 else 'mobile'}.png"),full_page=False)
 passed(records,slug,"no JavaScript exceptions",not errors,"; ".join(errors))
def verify(before_path:Path,out:Path,shots:Path)->None:
 before=json.loads(before_path.read_text(encoding="utf-8"))["courses"];records=[];failures=[]
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True);context=browser.new_context(viewport={"width":1440,"height":900})
  for slug in SLUGS:
   page=context.new_page()
   try:check_course(page,slug,before[slug],shots,records)
   except Exception as error:failures.append(str(error));records.append({"course":slug,"check":"course acceptance","status":"failed","detail":str(error)});print(f"FAIL {slug}: {error}")
   finally:page.close()
  browser.close()
 report={"mode":"Playwright Chromium over file:// with native browser storage","passed":sum(r["status"]=="passed" for r in records),"failed":len(failures),"checks":records,"failures":failures};out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8",newline="\n");print(json.dumps({"passed":report["passed"],"failed":report["failed"]},ensure_ascii=False))
 if failures:raise SystemExit(1)
def main()->int:
 parser=argparse.ArgumentParser();sub=parser.add_subparsers(dest="command",required=True);a=sub.add_parser("snapshot");a.add_argument("--out",type=Path,required=True);b=sub.add_parser("verify");b.add_argument("--before",type=Path,required=True);b.add_argument("--out",type=Path,required=True);b.add_argument("--screenshots",type=Path,required=True);c=sub.add_parser("static");c.add_argument("--before",type=Path,required=True);c.add_argument("--out",type=Path,required=True);args=parser.parse_args()
 if args.command=="snapshot":snapshot(args.out)
 elif args.command=="static":static_verify(args.before,args.out)
 else:verify(args.before,args.out,args.screenshots)
 return 0
if __name__=="__main__":raise SystemExit(main())
