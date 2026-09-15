from pathlib import Path
import re,base64
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];out=root/'validation/evidence';out.mkdir(exist_ok=True)
def content(p):
 s=p.read_text()
 for m in list(re.finditer(r'<img\b[^>]*src="([^"]+)"',s)):
  src=m.group(1);img=(p.parent/src).resolve()
  if img.exists():s=s.replace('src="'+src+'"','src="data:image/webp;base64,'+base64.b64encode(img.read_bytes()).decode()+'"')
 return re.sub(r'<link\b[^>]*rel="icon"[^>]*>','',s)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for name,path,w,h in [('desktop-home','public/index.html',1440,1040),('mobile-home','public/index.html',390,844),('gold-mobile','public/courses/gold-volatility/index.html',390,844),('unknown-mobile','public/courses/unknown-unknowable/index.html',390,844)]:
  p=b.new_page(viewport={'width':w,'height':h},color_scheme='light',reduced_motion='reduce')
  p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{},key:()=>null,length:0},configurable:true})")
  p.set_content(content(root/path));p.wait_for_timeout(250);p.screenshot(path=str(out/(name+'.png')),full_page='home'in name)
  if name=='desktop-home':p.locator('#themeBtn').click();p.locator('#themeBtn').evaluate('e=>e.blur()');p.screenshot(path=str(out/'desktop-home-dark.png'),full_page=True)
  p.close()
 b.close()
