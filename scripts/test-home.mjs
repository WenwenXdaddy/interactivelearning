import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {renderCatalog, routes} from './catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const courses = JSON.parse(fs.readFileSync(path.join(root, 'courses.json'), 'utf8'));
const context = {module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'content/portal/home.js'), 'utf8'), context);
const {parseFavorites, parseRecent, canResume, sortCards, matchesCard} = context.module.exports;
const known = new Set(courses.map(course => course.slug));
const normalize = value => JSON.parse(JSON.stringify(value));
assert.equal(courses.length, 14);
assert.equal(courses.find(course => course.slug === 'us-data-center-buildout').category, '产业与基础设施');
assert.equal(new Set(courses.map(c => c.slug)).size, 14);
assert.equal(routes.length, 2);
assert.equal(routes.every(route => route.slugs.length === 2 && route.slugs.every(slug => known.has(slug))), true);
assert.equal(renderCatalog(courses).COURSE_CARDS.match(/<article class="course /g)?.length, 14);
assert.deepEqual(normalize(parseFavorites('{"version":2,"slugs":["gold-volatility"]}', known)), []);
assert.deepEqual(normalize(parseFavorites('{"version":1,"slugs":["gold-volatility","fake","gold-volatility"]}', known)), ['gold-volatility']);
assert.deepEqual(normalize(parseFavorites('malformed', known)), []);
const now = Date.now();
const recent = parseRecent(JSON.stringify({version:1,items:[
  {slug:'gold-volatility',visitedAt:now-2000,capability:'station',label:'站 1'},
  {slug:'unknown-unknowable',visitedAt:now-1000,capability:'step'},
  {slug:'fake',visitedAt:now,capability:'step'},
  {slug:'pozsar-money-view',visitedAt:now-3000,capability:'visit'},
  {slug:'muscle-health-lyon',visitedAt:now-4000,capability:'visit'}
]}), known);
assert.deepEqual(normalize(recent.map(item => item.slug)), ['unknown-unknowable','gold-volatility','pozsar-money-view']);
assert.deepEqual(normalize(parseRecent('{"version":0,"items":[]}', known)), []);
assert.equal(canResume({capability:'step',adapterVersion:1}),true);
assert.equal(canResume({capability:'station',adapterVersion:1}),true);
assert.equal(canResume({capability:'visit',adapterVersion:1}),false);
assert.equal(canResume({capability:'step',adapterVersion:2}),false);
assert.equal(canResume({capability:'step'}),false);
const card = (slug, curated, added, updated, category, search, title) => ({
  dataset:{slug,curated:String(curated),added,updated,category,search},
  querySelector:() => ({textContent:title})
});
const sample = [
  card('gold-volatility',0,'2026-09-15T10:00:13Z','2026-09-15T10:00:13Z','投资与决策','黄金 期权','黄金波动率'),
  card('unknown-unknowable',1,'','2026-09-19T01:54:55+08:00','投资与决策','未知 投资','未知与不可知'),
  card('pozsar-money-view',2,'2026-09-16T17:28:58+08:00','','投资与决策','货币 资产负债表','货币观')
];
assert.deepEqual(normalize(sortCards(sample,'new').map(c=>c.dataset.slug)),[sample[2],sample[0],sample[1]].map(c=>c.dataset.slug));
assert.deepEqual(normalize(sortCards(sample,'updated').map(c=>c.dataset.slug)),[sample[1],sample[0],sample[2]].map(c=>c.dataset.slug));
assert.deepEqual(normalize(sortCards(sample,'curated').map(c=>c.dataset.slug)),sample.map(c=>c.dataset.slug));
assert.equal(matchesCard(sample[0],{category:'投资与决策',query:'期权',favoritesOnly:true,favorites:new Set(['gold-volatility'])}),true);
assert.equal(matchesCard(sample[1],{category:'投资与决策',query:'期权',favoritesOnly:true,favorites:new Set(['unknown-unknowable'])}),false);
assert.equal(matchesCard(sample[0],{category:'健康与科学',query:'',favoritesOnly:false,favorites:new Set()}),false);
for(const course of courses) {
  assert.match(course.sourceAddedCommit,/^[0-9a-f]{7}$/);
  assert.match(course.sourceUpdatedCommit,/^[0-9a-f]{7}$/);
  assert.ok(Number.isFinite(Date.parse(course.sourceAddedAt)));
  assert.ok(Number.isFinite(Date.parse(course.sourceUpdatedAt)));
}
console.log('Homepage catalog/storage/sort contract checks passed.');
