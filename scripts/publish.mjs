if(process.argv[2]!=='--cloudflare'){console.error('The GitHub repository already exists. Use node scripts/publish.mjs --cloudflare; do not run --all or create another repository.');process.exit(2);}
/** First publication helper. Uses browser login; never accepts, reads, prints or stores raw API secrets. */
import fs from 'node:fs';import path from 'node:path';import {spawnSync}from'node:child_process';import {fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const owner='WenwenXdaddy',repo='interactivelearning',full=owner+'/'+repo,domain='https://learning.jiadi.ai';
const mode=process.argv[2]||'--all';if(!['--all','--github','--cloudflare'].includes(mode)){console.error('Usage: node scripts/publish.mjs [--all|--github|--cloudflare]');process.exit(2)}
const wantGH=mode!=='--cloudflare',wantCF=mode!=='--github';
function command(cmd,args,{capture=false,allowFail=false}={}){const shell=process.platform==='win32'&&['npm','npx'].includes(cmd);const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',stdio:capture?'pipe':'inherit',shell});if(!allowFail&&(r.error||r.status!==0))throw new Error(`${cmd} failed. ${r.error?.message||'Read the output above; no later step has run.'}`);return r}
function requireCommand(cmd){const args=cmd==='node'?['--version']:['--version'];const r=command(cmd,args,{capture:true,allowFail:true});if(r.error||r.status!==0)throw new Error(`Missing command: ${cmd}. Install it from its official website and reopen the terminal.`)}
async function probeDomain(){try{const r=await fetch(domain+'/site-manifest.json',{signal:AbortSignal.timeout(12000),redirect:'follow'});const s=await r.text();let data;try{data=JSON.parse(s)}catch{}if(r.ok&&data?.id==='jiadi-learning-lab')return;if(r.status>=200&&r.status<400)throw new Error('The fixed domain is serving other content. Inspect existing DNS/Worker mappings before publishing; this helper will not take it over.');}catch(e){if(e.message?.startsWith('The fixed domain'))throw e;/* A DNS, TLS or timeout error is not evidence of domain ownership. Wrangler must validate the account and zone. */}}
try{
 console.log('Target repository: '+full+' (private). Target domain: '+domain);
 for(const c of ['node','npm',...(wantGH?['git','gh']:[])])requireCommand(c);
 // This intentionally installs Wrangler from the registry on the user's own computer, not in the website.
 command('npm',['install']);command('npm',['run','test']);
 if(wantGH){
  if(command('gh',['auth','status'],{capture:true,allowFail:true}).status!==0)command('gh',['auth','login','--hostname','github.com','--git-protocol','https','--web']);
  const login=command('gh',['api','user','--jq','.login'],{capture:true}).stdout.trim();if(login.toLowerCase()!==owner.toLowerCase())throw new Error('Wrong GitHub account: '+login+'. Expected '+owner+'.');
  const lookup=command('gh',['repo','view',full,'--json','nameWithOwner,isEmpty,isPrivate,url'],{capture:true,allowFail:true});let exists=false;
  if(lookup.status===0){exists=true;const r=JSON.parse(lookup.stdout);if(!r.isPrivate)throw new Error('The existing repository is public. Review it manually; visibility will not be changed automatically.');if(!r.isEmpty)throw new Error('The existing repository is not empty. Stop to reconcile its contents; no overwrite or force push is performed.');}
  const top=command('git',['rev-parse','--show-toplevel'],{capture:true,allowFail:true});
  if(top.status===0&&path.resolve(top.stdout.trim())!==root)throw new Error('This folder is inside another Git repository. Extract it to a separate folder first.');
  if(top.status!==0)command('git',['init','-b','main']);
  const branch=command('git',['branch','--show-current'],{capture:true}).stdout.trim();if(branch!=='main')throw new Error('Expected local main branch; no branch will be renamed automatically.');
  const remote=command('git',['remote','get-url','origin'],{capture:true,allowFail:true});
  if(remote.status===0&&!new RegExp(`(?:github\\.com[:/])${owner}/${repo}(?:\\.git)?$`,'i').test(remote.stdout.trim()))throw new Error('origin points to a different repository. Nothing was pushed.');
  const files=['.gitignore','README.md','AGENTS.md','DEPLOYMENT.md','Publish.ps1','docs','validation','content','templates','scripts','public','courses.json','package.json','wrangler.jsonc'];if(fs.existsSync('package-lock.json'))files.push('package-lock.json');
  command('git',['add','--',...files]);
  if(command('git',['diff','--cached','--quiet'],{capture:true,allowFail:true}).status!==0)command('git',['-c','user.name='+owner,'-c','user.email=195445100+'+owner+'@users.noreply.github.com','commit','-m','Initial learning site: two courses and fixed Cloudflare domain']);
  command('gh',['auth','setup-git','--hostname','github.com']);
  if(!exists){if(remote.status===0)throw new Error('Repository lookup failed but a local origin exists; check access manually before proceeding.');command('gh',['repo','create',full,'--private','--source=.','--remote=origin','--push','--homepage',domain,'--description','Interactive learning courses for investment, risk and decision-making']);}
  else{if(remote.status!==0)command('git',['remote','add','origin','https://github.com/'+full+'.git']);command('git',['push','-u','origin','main']);}
  command('gh',['repo','view',full,'--json','nameWithOwner,url,isPrivate']);console.log('GitHub publication completed.');
 }
 if(wantCF){
  await probeDomain();console.log('Cloudflare browser login follows. Select the account that owns jiadi.ai.');
  command('npx',['wrangler','login']);command('npx',['wrangler','whoami']);
  console.log('Deploying only this new learning-lab project and learning.jiadi.ai; do not approve replacement of an unrelated existing mapping.');
  command('npm',['run','deploy']);
  console.log('Deployment command finished. DNS/certificate issuance can take time; verification below may need a later retry.');
  const v=command('npm',['run','verify:live'],{allowFail:true});if(v.status!==0){console.warn('The live website has NOT been verified. Run npm run verify:live again after resolving the reported issue.');process.exitCode=1;}
  console.log('One remaining optional setup: connect the existing repository in this Worker’s Builds settings for automatic deployments. See DEPLOYMENT.md.');
 }
}catch(e){console.error('\nSTOPPED: '+e.message);process.exitCode=1}
