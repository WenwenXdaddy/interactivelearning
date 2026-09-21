import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'content/portal/sw.js'), 'utf8');
const origin = 'https://learning.jiadi.ai';
const config = { shellVersion: 'shell-v1', shellPaths: ['/index.html', '/offline.html'], bundles: { alpha: { title: '测试课程', marker: 'aaaabbbbccccdddd', version: 'bundle-v1', urls: ['/courses/alpha/index.html', '/courses/alpha/study-notes.md', '/assets/previews/alpha.webp', '/downloads/alpha.html', '/assets/portal/resume.js?v=1234567890abcdef', '/assets/portal/pwa.js?v=1234567890abcdef', '/assets/brand/logo.svg?v=1234567890abcdef', '/assets/brand/apple-touch-icon.png?v=1234567890abcdef', '/manifest.webmanifest'] } } };
const listeners = {};
const maps = new Map();
let failPath = null;
let quotaPath = null;
let offline = false;
let redirects = false;
let bridgeVersion = '1234567890abcdef';
const response = (body, url, status = 200, redirected = false) => {
  const result = new Response(body, { status, headers: { 'content-type': url.endsWith('.html') || url.endsWith('/') ? 'text/html' : 'text/plain' } });
  Object.defineProperty(result, 'url', { value: url });
  Object.defineProperty(result, 'redirected', { value: redirected });
  return result;
};
const network = async request => {
  const url = new URL(typeof request === 'string' ? request : request.url);
  if (offline || url.pathname === failPath) throw new Error('network unavailable');
  if (url.pathname === '/index.html') return response('<h1>Home</h1>', redirects ? `${origin}/` : url.href, 200, redirects);
  if (url.pathname === '/offline.html') return response('<h1>Offline</h1><div id="offline-manager"></div>', url.href);
  if (url.pathname === '/courses/alpha/index.html') return response(`<meta name="jiadi-course" content="alpha"><meta name="jiadi-course-build" content="${config.bundles.alpha.marker}"><script src="/assets/portal/resume.js?v=${bridgeVersion}"></script><script src="/assets/portal/pwa.js?v=1234567890abcdef"></script><link href="/assets/brand/logo.svg?v=1234567890abcdef"><link href="/assets/brand/apple-touch-icon.png?v=1234567890abcdef"><link href="/manifest.webmanifest"><h1>Course</h1>`, redirects ? `${origin}/courses/alpha/` : url.href, 200, redirects);
  if (url.pathname === '/courses/alpha/study-notes.md') return response('Notes', url.href);
  if (url.pathname === '/assets/portal/resume.js') return response('/* bridge */', url.href);
  if (config.bundles.alpha.urls.some(asset => new URL(asset, origin).pathname === url.pathname)) return response('Asset', url.href);
  return response('Not found', url.href, 404);
};
const caches = {
  async open(name) {
    if (!maps.has(name)) maps.set(name, new Map());
    const map = maps.get(name);
    return {
      async put(key, value) { if (new URL(String(key)).pathname === quotaPath) throw new Error('QuotaExceededError'); map.set(String(key), value.clone()); },
      async match(key) { return map.get(String(key))?.clone(); },
      async delete(key) { return map.delete(String(key)); }
    };
  },
  async keys() { return [...maps.keys()]; },
  async delete(name) { return maps.delete(name); }
};
const context = vm.createContext({
  self: { location: { origin }, addEventListener(name, listener) { listeners[name] = listener; }, clients: { async get() { return null; } } },
  caches, fetch: network, Response, URL, crypto: webcrypto, console
});
vm.runInContext(source.replace('__JIADI_CONFIG__', JSON.stringify(config)), context);
async function lifecycle(name) { let pending; listeners[name]({ waitUntil(promise) { pending = promise; } }); await pending; }
async function message(action, slug) {
  let pending; let final;
  const port = { postMessage(value) { if (!value.progress) final = value; } };
  listeners.message({ data: { action, slug }, ports: [port], waitUntil(promise) { pending = promise; } });
  await pending;
  return final;
}
async function navigate(url) {
  let pending;
  listeners.fetch({ request: { method: 'GET', mode: 'navigate', url }, respondWith(promise) { pending = promise; } });
  return pending;
}

await lifecycle('install');
assert(maps.has('jiadi-learning-pwa:shell:shell-v1'));
await lifecycle('activate');
assert(!source.includes('skipWaiting(') && !source.includes('clients.claim('));
assert.equal((await navigate(`${origin}/missing`)).status, 404, 'online 404 must pass through');
let intercepted = false;
listeners.fetch({ request: { method: 'GET', mode: 'navigate', url: 'https://example.com/other' }, respondWith() { intercepted = true; } });
assert.equal(intercepted, false, 'off-origin requests are untouched');

redirects = true;
assert.equal((await message('save', 'alpha')).ok, true, 'same-origin canonical HTML redirects are accepted');
const first = (await message('status', 'alpha')).result;
assert.equal(first.state, 'saved');
assert(first.bytes > 0);
assert.equal((await navigate(`${origin}/courses/alpha/`)).status, 200, 'saved slash alias works');
assert.equal((await navigate(`${origin}/courses/alpha/index.html`)).status, 200, 'saved index alias works');

vm.runInContext("CONFIG.bundles.alpha.version = 'bundle-v2'", context);
failPath = '/courses/alpha/study-notes.md';
assert.equal((await message('update', 'alpha')).ok, false, 'failed update reports failure');
const afterFailure = (await message('status', 'alpha')).result;
assert.equal(afterFailure.state, 'saved', 'old bundle remains available');
assert.equal(afterFailure.version, 'bundle-v1');
assert.equal(afterFailure.updateAvailable, true);
assert.equal((await navigate(`${origin}/courses/alpha/`)).status, 200);

failPath = null;
quotaPath = '/courses/alpha/study-notes.md';
assert.equal((await message('update', 'alpha')).ok, false, 'quota failure is reported');
assert.equal((await message('status', 'alpha')).result.version, 'bundle-v1', 'quota failure preserves prior copy');
quotaPath = null;
bridgeVersion = 'bbbbbbbbbbbbbbbb';
assert.equal((await message('update', 'alpha')).ok, false, 'cross-deploy dependency mismatch is rejected');
assert.equal((await message('status', 'alpha')).result.version, 'bundle-v1');
bridgeVersion = '1234567890abcdef';
assert.equal((await message('update', 'alpha')).ok, true);
assert.equal((await message('status', 'alpha')).result.version, 'bundle-v2');
assert.equal((await maps.get((await caches.keys()).find(name => name.startsWith('jiadi-learning-pwa:course:alpha:'))).size) > 0, true);
assert.equal((await message('remove', 'alpha')).result.state, 'unsaved');
offline = true;
assert((await (await navigate(`${origin}/courses/alpha/`)).text()).includes('Offline'), 'unsaved offline route has fallback');
assert((await (await navigate(`${origin}/`)).text()).includes('Home'), 'home slash alias works offline');
console.log('PASS platform worker: aliases, redirects, offline shell, network/quota/version rollback, removal, 404 and off-origin boundaries');
