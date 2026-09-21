import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const stateCourses = new Map([
  ['cognitive-flexibility-langer', 'learning:cognitive-flexibility-langer:v1'],
  ['diet-health-gardner', 'interactive-learning-lab:diet-health-gardner:v3'],
  ['healthy-masculinity', 'learning:healthy-masculinity:v1'],
  ['huberman-health-qa', 'interactive-learning-lab:huberman-health-qa:v1'],
  ['language-learning-science', 'learning:language-learning-science:v1'],
  ['muscle-health-lyon', 'learning-lab:muscle-health-lyon:v1'],
  ['overcome-inner-resistance', 'learning:overcome-inner-resistance:v1'],
  ['pozsar-money-view', 'pozsar-money-view:v1'],
  ['reclaim-your-brain', 'learning:reclaim-your-brain:v1'],
  ['unknown-unknowable', 'interactive-learning-lab:uu-investing:v1'],
  ['why-learning-tools-fail', 'learning:why-learning-tools-fail:v1'],
]);

const fixedLightCourses = [
  'unconditional-parenting',
  'us-data-center-buildout',
];

const courseHtml = (slug) => readFile(
  join('content', 'courses', slug, 'index.html'),
  'utf8',
);

const extractStatement = (html, pattern, label) => {
  const match = html.match(pattern);
  assert.ok(match, `${label}: source statement not found`);
  return match[0];
};

const executeStateThemeStatement = (statement, stateTheme, savedTheme) => {
  const state = { theme: stateTheme };
  const d = savedTheme === undefined ? {} : { theme: savedTheme };
  const execute = new Function(
    'state',
    'd',
    `'use strict'; ${statement} return state.theme;`,
  );
  return execute(state, d);
};

test('stateful courses execute their source restore and toggle assignments', async () => {
  for (const [slug, storageKey] of stateCourses) {
    const html = await courseHtml(slug);

    assert.match(
      html,
      /theme\s*:\s*['"]light['"]/,
      `${slug}: fresh state must select light`,
    );

    const restoreStatement = extractStatement(
      html,
      /state\.theme\s*=\s*d\.theme[^;]*;/,
      `${slug} restore`,
    );
    for (const [savedTheme, expected] of [
      [undefined, 'light'],
      ['sepia', 'light'],
      ['light', 'light'],
      ['dark', 'dark'],
    ]) {
      assert.equal(
        executeStateThemeStatement(restoreStatement, 'sentinel', savedTheme),
        expected,
        `${slug}: saved theme ${String(savedTheme)} must resolve to ${expected}`,
      );
    }

    const toggleStatement = extractStatement(
      html,
      /state\.theme\s*=\s*state\.theme[^;]*;/,
      `${slug} toggle`,
    );
    assert.equal(executeStateThemeStatement(toggleStatement, 'light'), 'dark', `${slug}: light must toggle to dark`);
    assert.equal(executeStateThemeStatement(toggleStatement, 'dark'), 'light', `${slug}: dark must toggle to light`);

    assert.ok(
      html.includes(storageKey),
      `${slug}: existing storage key must remain ${storageKey}`,
    );
    assert.match(
      html,
      /localStorage\.setItem\(KEY\s*,\s*JSON\.stringify\(state\)\)/,
      `${slug}: explicit theme choice must still save with course state`,
    );
  }
});

test('gold-volatility keeps its existing theme preference key and defaults it to light', async () => {
  const html = await courseHtml('gold-volatility');

  const loadFunction = extractStatement(
    html,
    /function load\(key,fallback\)\{[^\r\n]+\}/,
    'gold-volatility load',
  );
  const initStatement = extractStatement(
    html,
    /if\(load\(['"]theme['"]\s*,\s*['"]light['"]\)\s*!==\s*['"]dark['"]\)document\.body\.classList\.add\(['"]light['"]\);/,
    'gold-volatility initialization',
  );
  const resolveTheme = (storedValue) => {
    const classes = new Set();
    const localStorage = { getItem: (key) => {
      assert.equal(key, 'au-lab-theme');
      return storedValue;
    } };
    const document = { body: { classList: {
      add: (name) => classes.add(name),
      contains: (name) => classes.has(name),
    } } };
    const execute = new Function(
      'localStorage',
      'document',
      `'use strict'; ${loadFunction} ${initStatement} return document.body.classList.contains('light') ? 'light' : 'dark';`,
    );
    return execute(localStorage, document);
  };

  assert.equal(resolveTheme(null), 'light', 'gold-volatility: missing preference must use light');
  assert.equal(resolveTheme('{invalid json'), 'light', 'gold-volatility: corrupt preference must use the light fallback');
  assert.equal(resolveTheme(JSON.stringify('light')), 'light', 'gold-volatility: explicit light must remain light');
  assert.equal(resolveTheme(JSON.stringify('dark')), 'dark', 'gold-volatility: explicit dark must remain dark');
  assert.equal(resolveTheme(JSON.stringify('sepia')), 'light', 'gold-volatility: unsupported string must use light');
  assert.equal(resolveTheme(JSON.stringify(1)), 'light', 'gold-volatility: numeric legacy value must use light');
  assert.equal(resolveTheme(JSON.stringify(false)), 'light', 'gold-volatility: boolean legacy value must use light');

  assert.match(html, /localStorage\.getItem\(['"]au-lab-['"]\s*\+\s*key\)/);
  assert.match(html, /save\(['"]theme['"]\s*,\s*document\.body\.classList\.contains\(['"]light['"]\)\s*\?\s*['"]light['"]\s*:\s*['"]dark['"]\)/);
});

test('courses without a theme control remain intrinsically light', async () => {
  for (const slug of fixedLightCourses) {
    const html = await courseHtml(slug);
    assert.match(html, /:root\s*\{\s*color-scheme\s*:\s*light\s*;/, `${slug}: root scheme must be light`);
    assert.doesNotMatch(html, /id=['"]theme(?:-toggle|Btn)['"]/, `${slug}: no hidden theme control expected`);
  }
});
