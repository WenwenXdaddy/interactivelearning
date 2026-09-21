/* Generated configuration lists every URL this worker is allowed to cache. */
const CONFIG = __JIADI_CONFIG__;
const PREFIX = 'jiadi-learning-pwa:';
const SHELL = `${PREFIX}shell:${CONFIG.shellVersion}`;
const META = `${PREFIX}meta:v1`;
const COURSE_PREFIX = `${PREFIX}course:`;
const locks = new Map();
const own = path => new URL(path, self.location.origin).href;
const courseName = (slug, id) => `${COURSE_PREFIX}${slug}:${id}`;
const pointerKey = slug => own(`/__jiadi_offline__/course/${slug}`);
const validSlug = slug => Object.hasOwn(CONFIG.bundles, slug);
function expectedResponse(url, response) {
  if (!response?.ok || response.type === 'opaque') return false;
  const requested = new URL(url, self.location.origin);
  const received = new URL(response.url);
  if (requested.origin !== self.location.origin || received.origin !== self.location.origin) return false;
  if (!response.redirected) return received.pathname === requested.pathname && received.search === requested.search;
  const alias = requested.pathname === '/index.html' && received.pathname === '/'
    || /^\/courses\/[a-z0-9-]+\/index\.html$/.test(requested.pathname) && received.pathname === requested.pathname.replace(/index\.html$/, '');
  return alias && !requested.search && !received.search;
}

function canonical(path) {
  if (path === '/') return '/index.html';
  const match = /^\/courses\/([a-z0-9-]+)\/(?:index\.html)?$/.exec(path);
  return match && validSlug(match[1]) ? `/courses/${match[1]}/index.html` : path;
}
function slugFromCoursePath(path) {
  const match = /^\/courses\/([a-z0-9-]+)\/(?:index\.html|study-notes\.md)?$/.exec(path);
  return match && validSlug(match[1]) ? match[1] : null;
}
function ownedCourseCache(name, slug) {
  return name.startsWith(`${COURSE_PREFIX}${slug}:`) && /^[a-z0-9-]+$/.test(name.slice(`${COURSE_PREFIX}${slug}:`.length));
}
function dependenciesMatch(html, urls) {
  const authored = [...html.matchAll(/(?:src|href)="(\/assets\/(?:portal|brand)\/[^" ]+|\/manifest\.webmanifest)"/g)].map(match => match[1]);
  if (!authored.every(url => urls.includes(url))) return false;
  for (const url of urls) {
    if (!/^\/assets\/portal\/(?:home\.js|home\.css|pwa\.js|resume\.js)\?v=|^\/assets\/brand\/(?:logo\.svg|apple-touch-icon\.png)\?v=|^\/manifest\.webmanifest$/.test(url)) continue;
    if (!authored.includes(url)) return false;
  }
  return true;
}
async function hashMatches(url, response) {
  const expected = CONFIG.assetHashes?.[url];
  if (!expected) return true;
  const bytes = await response.clone().arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const actual = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return actual === expected;
}
async function pointer(slug) {
  const meta = await caches.open(META);
  const response = await meta.match(pointerKey(slug));
  if (!response) return null;
  try {
    const record = await response.json();
    const required = [`/courses/${slug}/index.html`, `/courses/${slug}/study-notes.md`, `/assets/previews/${slug}.webp`, `/downloads/${slug}.html`, '/manifest.webmanifest'];
    const known = url => required.includes(url) || /^\/assets\/portal\/(?:resume|pwa)\.js\?v=[0-9a-f]{16}$/.test(url) || /^\/assets\/brand\/(?:logo\.svg|apple-touch-icon\.png)\?v=[0-9a-f]{16}$/.test(url);
    if (record.slug !== slug || !ownedCourseCache(record.cacheName, slug) || !/^[0-9a-f]{16}$/.test(record.marker) || !Array.isArray(record.urls) || !required.every(url => record.urls.includes(url)) || new Set(record.urls).size !== record.urls.length || !record.urls.every(url => typeof url === 'string' && known(url))) return { corrupt: true };
    return record;
  } catch { return { corrupt: true }; }
}
async function inspect(slug) {
  if (!validSlug(slug)) throw new Error('Unknown course');
  const record = await pointer(slug);
  const names = await caches.keys();
  const generations = names.filter(name => ownedCourseCache(name, slug));
  if (!record) return { slug, title: CONFIG.bundles[slug].title, state: generations.length ? 'repair' : 'unsaved' };
  if (record.corrupt || !names.includes(record.cacheName)) return { slug, title: CONFIG.bundles[slug].title, state: 'repair' };
  const cache = await caches.open(record.cacheName);
  for (const url of record.urls) {
    const match = await cache.match(own(url));
    if (!match || !match.ok) return { slug, title: CONFIG.bundles[slug].title, state: 'repair' };
  }
  const html = await cache.match(own(`/courses/${slug}/index.html`));
  const htmlText = html && await html.text();
  if (!htmlText || !htmlText.includes(`<meta name="jiadi-course" content="${slug}">`) || !htmlText.includes(`<meta name="jiadi-course-build" content="${record.marker}">`) || !dependenciesMatch(htmlText, record.urls)) return { slug, title: CONFIG.bundles[slug].title, state: 'repair' };
  return { slug, title: CONFIG.bundles[slug].title, state: 'saved', version: record.version, updateAvailable: record.version !== CONFIG.bundles[slug].version, bytes: Number.isSafeInteger(record.bytes) ? record.bytes : null, savedAt: record.savedAt };
}
async function fetchExpected(url, slug) {
  const response = await fetch(own(url), { cache: 'no-store', credentials: 'same-origin' });
  if (!expectedResponse(url, response)) throw new Error(`Course asset unavailable: ${url}`);
  if (!(await hashMatches(url, response))) throw new Error(`Course asset version mismatch: ${url}`);
  if (url === `/courses/${slug}/index.html`) {
    const html = await response.clone().text();
    if (!html.includes(`<meta name="jiadi-course" content="${slug}">`) || !html.includes(`<meta name="jiadi-course-build" content="${CONFIG.bundles[slug].marker}">`) || !dependenciesMatch(html, CONFIG.bundles[slug].urls)) throw new Error('Course page version mismatch');
  }
  if (url.endsWith('.html') && !response.headers.get('content-type')?.includes('text/html')) throw new Error(`Unexpected HTML type: ${url}`);
  return response;
}
async function save(slug, progress = () => {}) {
  if (!validSlug(slug)) throw new Error('Unknown course');
  const bundle = CONFIG.bundles[slug];
  const id = `${bundle.version}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const newName = courseName(slug, id);
  const old = await pointer(slug);
  const fresh = await caches.open(newName);
  let committed = false;
  try {
    let bytes = 0;
    let completed = 0;
    for (const url of bundle.urls) {
      const response = await fetchExpected(url, slug);
      bytes += (await response.clone().arrayBuffer()).byteLength;
      await fresh.put(own(url), response);
      progress({ completed: ++completed, total: bundle.urls.length, bytes });
    }
    for (const url of bundle.urls) {
      const match = await fresh.match(own(url));
      if (!match || !match.ok) throw new Error(`Offline verification failed: ${url}`);
    }
    const html = await fresh.match(own(`/courses/${slug}/index.html`));
    const htmlText = await html.text();
    if (!htmlText.includes(`<meta name="jiadi-course" content="${slug}">`) || !htmlText.includes(`<meta name="jiadi-course-build" content="${bundle.marker}">`) || !dependenciesMatch(htmlText, bundle.urls)) throw new Error('Offline course verification failed');
    const meta = await caches.open(META);
    const record = { slug, cacheName: newName, version: bundle.version, marker: bundle.marker, urls: bundle.urls, bytes, savedAt: Date.now() };
    await meta.put(pointerKey(slug), new Response(JSON.stringify(record), { headers: { 'content-type': 'application/json' } }));
    committed = true;
    const status = await inspect(slug);
    if (status.state !== 'saved') throw new Error('Offline pointer verification failed');
    for (const name of await caches.keys()) if (ownedCourseCache(name, slug) && name !== newName) {
      try { await caches.delete(name); } catch { /* Orphan cleanup can wait; the active pointer is valid. */ }
    }
    return status;
  } catch (error) {
    if (!committed) await caches.delete(newName);
    if (committed) {
      // Restore the prior pointer if a post-commit verification failed.
      const meta = await caches.open(META);
      if (old && !old.corrupt) await meta.put(pointerKey(slug), new Response(JSON.stringify(old), { headers: { 'content-type': 'application/json' } }));
      else await meta.delete(pointerKey(slug));
      await caches.delete(newName);
    }
    throw error;
  }
}
async function remove(slug) {
  if (!validSlug(slug)) throw new Error('Unknown course');
  const meta = await caches.open(META);
  await meta.delete(pointerKey(slug));
  for (const name of await caches.keys()) if (ownedCourseCache(name, slug)) await caches.delete(name);
  return inspect(slug);
}
function serialized(slug, task) {
  const prior = locks.get(slug) || Promise.resolve();
  const next = prior.catch(() => {}).then(task);
  locks.set(slug, next);
  next.finally(() => { if (locks.get(slug) === next) locks.delete(slug); }).catch(() => {});
  return next;
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    try {
      for (const url of CONFIG.shellPaths) {
        const response = await fetch(own(url), { cache: 'no-store', credentials: 'same-origin' });
        if (!expectedResponse(url, response)) throw new Error(`Shell asset unavailable: ${url}`);
        if (!(await hashMatches(url, response))) throw new Error(`Shell asset version mismatch: ${url}`);
        if (url === '/index.html' && !dependenciesMatch(await response.clone().text(), CONFIG.shellPaths)) throw new Error('Homepage dependency version mismatch');
        if (url === '/offline.html' && !(await response.clone().text()).includes('id="offline-manager"')) throw new Error('Offline page identity check failed');
        await shell.put(own(url), response);
      }
      for (const url of CONFIG.shellPaths) if (!(await shell.match(own(url)))) throw new Error(`Shell verification failed: ${url}`);
    } catch (error) { await caches.delete(SHELL); throw error; }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(`${PREFIX}shell:`) && name !== SHELL) await caches.delete(name);
  })());
});
self.addEventListener('message', event => {
  const port = event.ports?.[0];
  if (!port) return;
  const { action, slug } = event.data || {};
  const work = (async () => {
    if (action === 'list') return { version: CONFIG.shellVersion, courses: await Promise.all(Object.keys(CONFIG.bundles).map(inspect)) };
    if (action === 'status') return inspect(slug);
    if (action === 'save' || action === 'update') return serialized(slug, () => save(slug, progress => port.postMessage({ progress })));
    if (action === 'remove') return serialized(slug, () => remove(slug));
    throw new Error('Unsupported offline action');
  })();
  event.waitUntil(work.then(result => port.postMessage({ ok: true, result }), error => port.postMessage({ ok: false, error: String(error?.message || error) })));
});

async function courseCache(slug, url) {
  const record = await pointer(slug);
  if (!record || record.corrupt || !(await caches.keys()).includes(record.cacheName) || !record.urls.includes(url)) return null;
  const cache = await caches.open(record.cacheName);
  return (await cache.match(own(url))) || null;
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = canonical(url.pathname);
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      if (path === '/index.html') {
        try { return await fetch(request); } catch {}
        return (await (await caches.open(SHELL)).match(own('/index.html'))) || Response.error();
      }
      const slug = slugFromCoursePath(path);
      if (slug) {
        const saved = await courseCache(slug, path);
        if (saved) return saved;
      }
      try { return await fetch(request); } catch {}
      return (await (await caches.open(SHELL)).match(own('/offline.html'))) || Response.error();
    })());
    return;
  }
  event.respondWith((async () => {
    const key = path + url.search;
    let slug = slugFromCoursePath(path);
    if (!slug && event.clientId) {
      const client = await self.clients.get(event.clientId);
      if (client) slug = slugFromCoursePath(canonical(new URL(client.url).pathname));
    }
    if (slug) {
      const saved = await courseCache(slug, key);
      if (saved) return saved;
    }
    // Course-specific notes, previews and standalone downloads can be requested from the catalog.
    if (!slug) for (const candidate of Object.keys(CONFIG.bundles)) {
      if (!CONFIG.bundles[candidate].urls.includes(key)) continue;
      const saved = await courseCache(candidate, key);
      if (saved) return saved;
    }
    const shell = await (await caches.open(SHELL)).match(own(key));
    if (shell) return shell;
    return fetch(request);
  })());
});
