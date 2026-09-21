/* Portal reading position bridge. This file is added to generated pages only. */
(() => {
  'use strict';

  const KEY = 'jiadi-learning-portal:recent:v1';
  const VERSION = 1;
  const ADAPTER_VERSION = 1;
  const MAX_ITEMS = 50;
  const STEP_PATTERNS = {
    'unknown-unknowable': /^st\d{2}-\d+$/,
    'pozsar-money-view': /^s\d+-\d+$/,
    'muscle-health-lyon': /^s\d+-\d+$/,
    'cognitive-flexibility-langer': /^s\d+-\d+$/,
    'reclaim-your-brain': /^s\d+-\d+$/,
    'why-learning-tools-fail': /^s\d+-\d+$/,
    'overcome-inner-resistance': /^s\d{2}-\d+$/,
    'diet-health-gardner': /^s\d{2}-\d+$/,
    'healthy-masculinity': /^step-\d{2}-\d+$/,
    'huberman-health-qa': /^step-\d+-\d+$/,
    'language-learning-science': /^step-\d+-\d+$/,
    'unconditional-parenting': /^s\d{2}-\d+$/,
    'outlive-guided-full': /^s\d+-\d+$/
  };
  const KIND = {
    ...Object.fromEntries(Object.keys(STEP_PATTERNS).map(slug => [slug, 'steps'])),
    'gold-volatility': 'gold',
    'us-data-center-buildout': 'dc'
  };
  const script = document.currentScript || document.querySelector('script[data-course][src$="/resume.js"]');
  const slug = script?.dataset.course;
  if (!Object.hasOwn(KIND, slug)) return;

  const kind = KIND[slug];
  let captureTimer = 0;
  let pendingCapture = null;
  let suppressUntil = performance.now() + 2200;
  let sourceJumpActive = false;
  let storageReported = false;
  let recent = readRecent();
  const saved = recent.items.find(item => item.slug === slug) || null;
  const wantsResume = new URL(location.href).searchParams.get('resume') === '1';

  function reportStorageFailure() {
    if (storageReported) return;
    storageReported = true;
    const note = document.createElement('p');
    note.setAttribute('role', 'status');
    note.textContent = '此浏览器未能保存最近阅读位置；课程仍可正常阅读。';
    note.style.cssText = 'margin:1rem auto;padding:.7rem 1rem;max-width:70rem;border:1px solid currentColor;border-radius:.6rem;font:inherit';
    document.body.append(note);
  }

  function validItem(item) {
    return item && typeof item === 'object' && Object.hasOwn(KIND, item.slug) &&
      Number.isFinite(item.visitedAt) && item.visitedAt > 0 &&
      ['visit', 'station', 'step'].includes(item.capability) &&
      (item.lessonId === null || (typeof item.lessonId === 'string' && item.lessonId.length <= 24)) &&
      (item.stepId === null || (typeof item.stepId === 'string' && item.stepId.length <= 48)) &&
      typeof item.label === 'string' && item.label.length <= 100;
  }

  function readRecent() {
    let raw;
    try {
      raw = localStorage.getItem(KEY);
    } catch {
      reportStorageFailure();
      return { version: VERSION, items: [] };
    }
    if (raw === null) return { version: VERSION, items: [] };
    try {
      const data = JSON.parse(raw);
      if (data?.version !== VERSION || !Array.isArray(data.items)) return { version: VERSION, items: [] };
      return { version: VERSION, items: data.items.filter(validItem).slice(0, MAX_ITEMS) };
    } catch {
      return { version: VERSION, items: [] };
    }
  }

  function write(item) {
    // Merge against the latest portal value: another course tab may have written
    // since this tab opened. This is still only a best-effort localStorage merge.
    recent = readRecent();
    const items = [item, ...recent.items.filter(other => other.slug !== slug)]
      .sort((a, b) => b.visitedAt - a.visitedAt).slice(0, MAX_ITEMS);
    recent = { version: VERSION, items };
    try { localStorage.setItem(KEY, JSON.stringify(recent)); }
    catch { reportStorageFailure(); }
  }

  function cleanLabel(text) {
    return (text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function lessonNode() {
    if (kind === 'gold') return document.querySelector('section.lesson.active[id^="lesson"]');
    if (kind === 'dc') return document.querySelector('#main[data-reading-chapter]');
    return [...document.querySelectorAll('.lesson[data-lesson]')].find(el => !el.hidden) || null;
  }

  function positionFromDOM(includeStep) {
    const lesson = lessonNode();
    if (!lesson) return null;
    let lessonId;
    if (kind === 'gold') lessonId = lesson.id.replace(/^lesson/, '');
    else if (kind === 'dc') {
      if (!/^#learn\/[1-5](?:\/|$)/.test(location.hash)) return null;
      lessonId = lesson.dataset.readingChapter;
    } else lessonId = lesson.dataset.lesson;
    if (!lessonId) return null;
    const heading = kind === 'dc'
      ? lesson.querySelector('.chapter-heading h1')
      : lesson.querySelector('h1,h2');
    let stepId = null;
    if (kind === 'steps' && includeStep) {
      const threshold = innerHeight * .38;
      const steps = [...lesson.querySelectorAll('.step[id]')].filter(el =>
        STEP_PATTERNS[slug].test(el.id) &&
        !el.closest('.quiz-card,.source-doc,.glossary,dialog') &&
        el.getClientRects().length > 0);
      const current = steps.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top <= threshold && rect.bottom > 0;
      }).at(-1);
      stepId = current?.id || null;
    }
    return {
      slug, visitedAt: Date.now(), lessonId: String(lessonId), stepId,
      label: cleanLabel(heading?.textContent),
      capability: stepId ? 'step' : 'station', adapterVersion: ADAPTER_VERSION
    };
  }

  function capture(includeStep = true) {
    if (performance.now() < suppressUntil || sourceJumpActive) return;
    const position = positionFromDOM(includeStep);
    if (position) write(position);
  }

  function queueCapture(includeStep = true, delay = 350, genuine = false) {
    clearTimeout(captureTimer);
    pendingCapture = { includeStep, genuine: genuine || Boolean(pendingCapture?.genuine) };
    captureTimer = setTimeout(() => {
      const pending = pendingCapture;
      pendingCapture = null;
      if (pending) capture(pending.includeStep);
    }, delay);
  }

  function validTarget(item) {
    if (!validItem(item) || item.slug !== slug || item.adapterVersion !== ADAPTER_VERSION ||
        !['station', 'step'].includes(item.capability) || !item.lessonId) return null;
    const id = item.lessonId;
    if (kind === 'gold') {
      if (!/^(?:[0-9])$/.test(id)) return null;
      const lesson = document.getElementById('lesson' + id);
      const control = document.querySelector(`#nav button[data-go="${id}"]`);
      return lesson && control ? { lesson, control, step: null } : null;
    }
    if (kind === 'dc') {
      if (!/^[1-5]$/.test(id)) return null;
      const control = document.querySelector(`#chapter-select option[value="${id}"]`);
      return control ? { lesson: null, control, step: null } : null;
    }
    if (!/^\d{1,2}$/.test(id)) return null;
    const lesson = [...document.querySelectorAll('.lesson[data-lesson]')]
      .find(el => el.dataset.lesson === id);
    const controls = slug === 'unconditional-parenting'
      ? [...document.querySelectorAll('.nav-item[data-go]')]
      : [...document.querySelectorAll('[data-lesson-button]')];
    const control = controls.find(el =>
      (slug === 'unconditional-parenting' ? el.dataset.go : el.dataset.lessonButton) === id);
    if (!lesson || !control) return null;
    let step = null;
    if (item.capability === 'step') {
      if (!item.stepId || !STEP_PATTERNS[slug].test(item.stepId)) return null;
      step = document.getElementById(item.stepId);
      if (!step || !lesson.contains(step) || !step.classList.contains('step')) return null;
    } else if (item.stepId !== null) return null;
    return { lesson, control, step };
  }

  function removeResumeParameter() {
    const url = new URL(location.href);
    url.searchParams.delete('resume');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }

  function goToStart() {
    if (kind === 'dc') { location.hash = '#learn/1'; return; }
    const control = kind === 'gold'
      ? document.querySelector('#nav button[data-go="0"]')
      : slug === 'unconditional-parenting'
        ? document.querySelector('.nav-item[data-go="00"]')
        : document.querySelector('[data-lesson-button="0"]');
    control?.click();
  }

  function keepStepBelowHeader(step) {
    const stepRect = step.getBoundingClientRect();
    const authored = Number.parseFloat(getComputedStyle(step).scrollMarginTop) || 0;
    let headerBottom = 0;
    for (const header of document.querySelectorAll('.header,header,[role="banner"]')) {
      const position = getComputedStyle(header).position;
      if (position !== 'fixed' && position !== 'sticky') continue;
      const rect = header.getBoundingClientRect();
      if (rect.top > 12 || rect.bottom <= 0 || rect.height > innerHeight * .45 ||
          rect.right <= stepRect.left || rect.left >= stepRect.right) continue;
      headerBottom = Math.max(headerBottom, rect.bottom);
    }
    const needed = Math.ceil(headerBottom + 12);
    if (headerBottom > 0 && needed > authored) step.style.scrollMarginTop = needed + 'px';
  }

  function restore(retried = false) {
    suppressUntil = performance.now() + 2200;
    if (kind === 'dc' && !document.querySelector('#chapter-select') && !retried) {
      location.hash = '#learn/1';
      setTimeout(() => restore(true), 100);
      return;
    }
    const target = validTarget(saved);
    if (!target) {
      goToStart();
      write({ slug, visitedAt: Date.now(), lessonId: null, stepId: null,
        label: '', capability: 'visit', adapterVersion: ADAPTER_VERSION });
      removeResumeParameter();
      return;
    }
    if (kind === 'dc') location.hash = '#learn/' + saved.lessonId;
    else target.control.click();
    if (target.step) setTimeout(() => {
      if (target.lesson && !target.lesson.hidden && target.step.isConnected &&
          target.step.getClientRects().length > 0) {
        keepStepBelowHeader(target.step);
        target.step.scrollIntoView({ block: 'start', behavior: 'instant' });
      } else {
        write({ ...saved, visitedAt: Date.now(), stepId: null, capability: 'station' });
      }
    }, 220);
    write({ ...saved, visitedAt: Date.now() });
    removeResumeParameter();
  }

  // Opening a course records a visit while retaining a validated prior position.
  // This does not inspect the course's own storage or alter its initial navigation.
  if (wantsResume) setTimeout(restore, 0);
  else if (saved && (kind === 'dc'
    ? validItem(saved) && saved.adapterVersion === ADAPTER_VERSION && /^[1-5]$/.test(saved.lessonId || '')
    : validTarget(saved))) write({ ...saved, visitedAt: Date.now() });
  else write({ slug, visitedAt: Date.now(), lessonId: null, stepId: null,
    label: '', capability: 'visit', adapterVersion: ADAPTER_VERSION });

  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-src],[data-source],.src-jump,.source-doc')) {
      sourceJumpActive = true;
      suppressUntil = performance.now() + 1500;
      return;
    }
    if (target.closest('.source-return,.quiz-card,.glossary,dialog,[data-term]')) {
      if (target.closest('.source-return')) sourceJumpActive = false;
      suppressUntil = performance.now() + 1500;
      return;
    }
    const nav = kind === 'gold' ? target.closest('button[data-go],#prevBtn,#nextBtn')
      : kind === 'dc' ? target.closest('a[href^="#learn/"]')
        : slug === 'unconditional-parenting' ? target.closest('.nav-item[data-go],.route button[data-go],.primary[data-go]')
          : target.closest('[data-lesson-button],#previous-button,#next-button,.route button[data-go],.primary[data-go]');
    if (nav && event.isTrusted) {
      sourceJumpActive = false;
      suppressUntil = 0;
      queueCapture(false, 450, true);
    }
  }, true);

  if (kind === 'dc') {
    window.addEventListener('hashchange', () => {
      if (pendingCapture?.genuine) queueCapture(false, 450, true);
    });
    document.addEventListener('change', event => {
      if (event.target?.id === 'chapter-select' && event.isTrusted) {
        suppressUntil = 0;
        queueCapture(false, 450, true);
      }
    });
  } else {
    const onScrollIntent = event => {
      if (event.target instanceof Element &&
          event.target.closest('.source-doc,.quiz-card,.glossary,dialog')) return;
      if (event.isTrusted) {
        suppressUntil = 0;
        queueCapture(true, 650, true);
      }
    };
    window.addEventListener('wheel', onScrollIntent, { passive: true });
    window.addEventListener('touchmove', onScrollIntent, { passive: true });
    window.addEventListener('keydown', event => {
      if (event.isTrusted && ['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', ' ', 'Home', 'End'].includes(event.key) &&
          !(event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable],dialog,.quiz-card,.glossary'))) {
        suppressUntil = 0;
        queueCapture(true, 650, true);
      }
    });
  }
  window.addEventListener('storage', event => {
    if (event.key === KEY) recent = readRecent();
  });
  window.addEventListener('pagehide', () => {
    if (!pendingCapture?.genuine) return;
    clearTimeout(captureTimer);
    const pending = pendingCapture;
    pendingCapture = null;
    capture(pending.includeStep);
  });
})();
