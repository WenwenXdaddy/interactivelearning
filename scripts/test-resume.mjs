import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, x => x.slice(1));
const source = readFileSync(join(root, 'content/portal/resume.js'), 'utf8');
const cases = [
  ['unknown-unknowable', 15, /^st\d{2}-\d+$/],
  ['pozsar-money-view', 22, /^s\d+-\d+$/],
  ['muscle-health-lyon', 17, /^s\d+-\d+$/],
  ['cognitive-flexibility-langer', 13, /^s\d+-\d+$/],
  ['reclaim-your-brain', 12, /^s\d+-\d+$/],
  ['why-learning-tools-fail', 24, /^s\d+-\d+$/],
  ['overcome-inner-resistance', 13, /^s\d{2}-\d+$/],
  ['diet-health-gardner', 15, /^s\d{2}-\d+$/],
  ['healthy-masculinity', 14, /^step-\d{2}-\d+$/],
  ['huberman-health-qa', 18, /^step-\d+-\d+$/],
  ['language-learning-science', 15, /^step-\d+-\d+$/],
  ['unconditional-parenting', 37, /^s\d{2}-\d+$/],
  ['brain-vitality', 17, /^s\d{2}-\d+$/],
  ['outlive-guided-full', 32, /^s\d+-\d+$/]
];
const registeredSlugs = [...cases.map(([slug]) => slug), 'gold-volatility', 'us-data-center-buildout'];

function tags(html, name) { return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(x => x[0]); }
function attr(tag, name) { return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null; }
for (const [slug, count, pattern] of cases) {
  const html = readFileSync(join(root, 'content/courses', slug, 'index.html'), 'utf8');
  const lessons = tags(html, 'section').filter(tag => /\blesson\b/.test(attr(tag, 'class') || '') && attr(tag, 'data-lesson') !== null);
  const ids = lessons.map(tag => attr(tag, 'data-lesson'));
  assert.equal(lessons.length, count, `${slug}: lesson count`);
  assert.equal(new Set(ids).size, count, `${slug}: unique lessons`);
  const buttons = tags(html, 'button');
  const nav = ['unconditional-parenting', 'brain-vitality'].includes(slug)
    ? buttons.filter(tag => /\bnav-item\b/.test(attr(tag, 'class') || '')).map(tag => attr(tag, 'data-go'))
    : buttons.map(tag => attr(tag, 'data-lesson-button')).filter(x => x !== null);
  assert.deepEqual(nav, ids, `${slug}: every lesson has an existing control`);
  const steps = tags(html, 'div').filter(tag => /\bstep\b/.test(attr(tag, 'class') || '') && attr(tag, 'id'));
  assert.ok(steps.length > 0, `${slug}: stable step candidates`);
  assert.ok(steps.every(tag => pattern.test(attr(tag, 'id'))), `${slug}: step ID pattern`);
  assert.equal(new Set(steps.map(tag => attr(tag, 'id'))).size, steps.length, `${slug}: unique step IDs`);
}

const gold = readFileSync(join(root, 'content/courses/gold-volatility/index.html'), 'utf8');
assert.deepEqual(tags(gold, 'section').map(tag => attr(tag, 'id')).filter(id => /^lesson\d+$/.test(id || '')),
  Array.from({ length: 10 }, (_, n) => `lesson${n}`));
assert.match(gold, /<button data-go="\$\{i\}"/);
assert.match(gold, /function go\(i,scroll=true\)/);

const dc = readFileSync(join(root, 'content/courses/us-data-center-buildout/index.html'), 'utf8');
assert.match(dc, /main\.dataset\.readingChapter=String\(n\)/);
assert.match(dc, /<select id="chapter-select">\$\{R\.map/);
assert.match(dc, /function navigate\(hash\)/);
assert.match(dc, /window\.addEventListener\('hashchange'/);

// Execute the actual bridge with a small DOM harness to cover storage boundaries
// and the opt-in restore contract without depending on a browser test package.
const key = 'jiadi-learning-portal:recent:v1';
function harness(raw, query = '', flushTimers = true, authoredMargin = 0) {
  const data = new Map(raw === undefined ? [] : [[key, raw]]);
  const reads = [];
  const timers = [];
  const listeners = { document: {}, window: {} };
  const clicked = [];
  const scrolled = [];
  const lessons = ['0', '1'].map(id => ({
    dataset: { lesson: id }, hidden: id !== '0',
    contains: element => element.id === 'st01-2' && id === '1',
    querySelector: () => ({ textContent: `Lesson ${id}` })
  }));
  const step = { id: 'st01-2', isConnected: true, style: {},
    classList: { contains: value => value === 'step' },
    getClientRects: () => [{}],
    getBoundingClientRect: () => ({ left: 300, right: 700, top: 300, bottom: 500 }),
    scrollIntoView: () => scrolled.push('st01-2') };
  const header = { getBoundingClientRect: () => ({ left: 0, right: 1000, top: 0, bottom: 68, height: 68 }) };
  const controls = ['0', '1'].map(id => ({
    dataset: { lessonButton: id }, click: () => {
      clicked.push(id); lessons.forEach(node => { node.hidden = node.dataset.lesson !== id; });
    }
  }));
  class FakeElement {
    closest(selector) { return selector.includes('[data-lesson-button]') ? controls[1] : null; }
  }
  const document = {
    currentScript: { dataset: { course: 'unknown-unknowable' } },
    body: { append() {} }, addEventListener: (name, fn) => { listeners.document[name] = fn; },
    createElement: () => ({ setAttribute() {}, style: {} }),
    querySelectorAll(selector) {
      if (selector === '.lesson[data-lesson]') return lessons;
      if (selector === '[data-lesson-button]') return controls;
      if (selector === '.header,header,[role="banner"]') return [header];
      return [];
    },
    querySelector(selector) { return selector === '[data-lesson-button="0"]' ? controls[0] : null; },
    getElementById: id => id === 'st01-2' ? step : null
  };
  const replaced = [];
  const location = { href: `https://learning.jiadi.ai/courses/unknown-unknowable/index.html${query}`, hash: '' };
  const context = {
    document, location, history: { state: null, replaceState: (_state, _title, url) => replaced.push(url) },
    localStorage: { getItem: name => { reads.push(name); return data.get(name) ?? null; }, setItem: (name, value) => data.set(name, value) },
    window: { addEventListener: (name, fn) => { listeners.window[name] = fn; } },
    Element: FakeElement, URL, Date, Object, performance: { now: () => 10000 },
    getComputedStyle: element => element === step
      ? { scrollMarginTop: `${authoredMargin}px` } : { position: 'sticky' },
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {}, innerHeight: 800
  };
  vm.runInNewContext(source, context, { filename: 'resume.js' });
  if (flushTimers) while (timers.length) timers.shift()();
  return {
    item: JSON.parse(data.get(key)).items[0], clicked, scrolled, replaced, reads, controls, step,
    current: () => JSON.parse(data.get(key)).items,
    dispatchClick: isTrusted => listeners.document.click({ target: new FakeElement(), isTrusted }),
    dispatchPagehide: () => listeners.window.pagehide(),
    addOtherCourse: () => {
      const record = JSON.parse(data.get(key));
      record.items.push({ slug: 'gold-volatility', visitedAt: 5000, lessonId: null,
        stepId: null, label: '', capability: 'visit', adapterVersion: 1 });
      data.set(key, JSON.stringify(record));
    }
  };
}

const record = (stepId = 'st01-2') => JSON.stringify({ version: 1, items: [{
  slug: 'unknown-unknowable', visitedAt: 1000, lessonId: '1', stepId,
  label: 'Lesson 1', capability: 'step', adapterVersion: 1
}] });
let result = harness(record());
assert.deepEqual(result.clicked, [], 'plain entry never forces portal restore');
assert.equal(result.item.stepId, 'st01-2');
assert.ok(result.reads.length > 0 && result.reads.every(name => name === key),
  'bridge reads only portal recent key');
result = harness(record(), '?resume=1');
assert.deepEqual(result.clicked, ['1']);
assert.deepEqual(result.scrolled, ['st01-2']);
assert.equal(result.step.style.scrollMarginTop, '80px', 'restore clears 68px sticky header with 12px gap');
assert.deepEqual(result.replaced, ['/courses/unknown-unknowable/index.html']);
result = harness(record(), '?resume=1', true, 96);
assert.equal(result.step.style.scrollMarginTop, undefined, 'larger authored scroll margin is retained');
result = harness(record('st01-99'), '?resume=1');
assert.deepEqual(result.clicked, ['0'], 'deleted step falls back to course start');
assert.equal(result.item.capability, 'visit');
result = harness('{broken', '?resume=1');
assert.deepEqual(result.clicked, ['0'], 'malformed portal data falls back cleanly');
assert.equal(result.item.capability, 'visit');
result = harness(undefined, '', false);
result.dispatchClick(true);
result.controls[1].click();
result.addOtherCourse();
result.dispatchPagehide();
assert.equal(result.current()[0].lessonId, '1', 'pagehide flushes a real pending station navigation');
assert.equal(result.current()[0].capability, 'station');
assert.equal(result.current().length, 2, 'pagehide merge retains a second course tab record');
result = harness(undefined, '', false);
result.dispatchClick(false);
result.controls[1].click();
result.dispatchPagehide();
assert.equal(result.current()[0].capability, 'visit', 'untrusted navigation is not flushed');
const fullCatalog = JSON.stringify({ version: 1, items: registeredSlugs.map((slug, index) => ({
  slug, visitedAt: 1000 - index, lessonId: null, stepId: null,
  label: '', capability: 'visit', adapterVersion: 1
})) });
result = harness(fullCatalog);
assert.equal(result.current().length, registeredSlugs.length, 'a new visit retains all registered course records');
assert.deepEqual(new Set(result.current().map(item => item.slug)), new Set(registeredSlugs));

console.log('Resume adapter source contracts and bridge storage/restore tests passed (16 courses).');
