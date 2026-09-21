(() => {
  'use strict';
  const FAVORITES = 'jiadi-learning-portal:favorites:v1';
  const RECENT = 'jiadi-learning-portal:recent:v1';
  const THEME = 'jiadi-learning-portal:theme:v1';
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function parseFavorites(raw, known) {
    try {
      const value = JSON.parse(raw);
      if (value?.version !== 1 || !Array.isArray(value.slugs)) return [];
      return [...new Set(value.slugs.filter(slug => typeof slug === 'string' && known.has(slug)))];
    } catch { return []; }
  }
  function parseRecent(raw, known) {
    try {
      const value = JSON.parse(raw);
      if (value?.version !== 1 || !Array.isArray(value.items)) return [];
      const seen = new Set();
      return value.items.filter(item => {
        if (!item || typeof item.slug !== 'string' || !validSlug.test(item.slug) || !known.has(item.slug) ||
            seen.has(item.slug) || typeof item.visitedAt !== 'number' || !Number.isFinite(item.visitedAt) ||
            item.visitedAt < 0 || item.visitedAt > Date.now() + 86400000 ||
            !['visit', 'station', 'step'].includes(item.capability)) return false;
        seen.add(item.slug);
        return true;
      }).sort((a, b) => b.visitedAt - a.visitedAt).slice(0, 3);
    } catch { return []; }
  }
  function canResume(item) {
    return item.adapterVersion === 1 && (item.capability === 'station' || item.capability === 'step');
  }
  function sortCards(cards, mode) {
    const list = [...cards];
    const date = (card, field) => {
      const parsed = Date.parse(card.dataset[field] || '');
      return Number.isFinite(parsed) ? parsed : null;
    };
    list.sort((a, b) => {
      if (mode === 'new' || mode === 'updated') {
        const field = mode === 'new' ? 'added' : 'updated';
        const aa = date(a, field), bb = date(b, field);
        if (aa === null && bb !== null) return 1;
        if (bb === null && aa !== null) return -1;
        if (aa !== null && bb !== null && aa !== bb) return bb - aa;
      } else if (mode === 'title') {
        const difference = a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'zh-CN');
        if (difference) return difference;
      }
      return Number(a.dataset.curated) - Number(b.dataset.curated);
    });
    return list;
  }
  function matchesCard(card, {category, query, favoritesOnly, favorites}) {
    return (category === 'all' || card.dataset.category === category) &&
      (!favoritesOnly || favorites.has(card.dataset.slug)) &&
      card.dataset.search.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {parseFavorites, parseRecent, canResume, sortCards, matchesCard};
  if (typeof document === 'undefined') return;

  const cards = [...document.querySelectorAll('.course')];
  const known = new Set(cards.map(card => card.dataset.slug));
  const titles = new Map(cards.map(card => [card.dataset.slug, card.querySelector('h3').textContent]));
  const grid = document.getElementById('courseGrid');
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  const categoryButtons = [...document.querySelectorAll('[data-filter]')];
  const favoriteButtons = [...document.querySelectorAll('[data-favorite]')];
  const favoritesOnly = document.getElementById('favoritesOnly');
  const storageMessage = document.getElementById('storageMessage');
  const recentSection = document.getElementById('recent');
  const recentList = document.getElementById('recentList');
  let category = 'all';
  let favorites = new Set();
  let storageAvailable = true;
  const announceStorage = () => { storageAvailable = false; storageMessage.hidden = false; };
  const read = key => {
    try { return localStorage.getItem(key); } catch { announceStorage(); return null; }
  };
  const write = (key, payload) => {
    try { localStorage.setItem(key, JSON.stringify(payload)); return true; }
    catch { announceStorage(); return false; }
  };
  const writeTheme = value => {
    try { localStorage.setItem(THEME, value); }
    catch { announceStorage(); }
  };
  function refreshFavorites() {
    favorites = new Set(parseFavorites(read(FAVORITES), known));
    favoriteButtons.forEach(button => {
      const selected = favorites.has(button.dataset.favorite);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', (selected ? '取消收藏' : '收藏') + titles.get(button.dataset.favorite));
      button.querySelector('span:first-child').textContent = selected ? '★' : '☆';
      button.querySelector('span:last-child').textContent = selected ? '已收藏' : '收藏';
      button.hidden = !storageAvailable;
    });
    favoritesOnly.hidden = !storageAvailable;
    if (!storageAvailable) { favoritesOnly.setAttribute('aria-pressed', 'false'); }
  }
  function refreshRecent() {
    const items = parseRecent(read(RECENT), known);
    recentList.replaceChildren();
    items.forEach(item => {
      const box = document.createElement('article');
      box.className = 'recent-item';
      const link = document.createElement('a');
      link.href = '/courses/' + item.slug + '/index.html' + (canResume(item) ? '?resume=1' : '');
      link.textContent = titles.get(item.slug);
      const detail = document.createElement('small');
      const label = typeof item.label === 'string' ? item.label.trim().slice(0, 80) : '';
      detail.textContent = canResume(item) ? ('继续阅读' + (label ? ' · ' + label : '')) : '最近打开';
      box.append(link, detail);
      recentList.append(box);
    });
    recentSection.hidden = !items.length;
  }
  // Cover shelf: native scroll-snap track with JS-computed 3D tilt. Order stays newest-first;
  // filters, search and favorites apply to it exactly as they do to the grid.
  const shelf = document.querySelector('.shelf');
  const shelfTrack = document.querySelector('.shelf-track');
  const shelfPanel = document.querySelector('.shelf-detail');
  const shelfItems = shelfTrack ? [...shelfTrack.children].filter(el => el.classList.contains('shelf-item')) : [];
  const shelfDotsWrap = document.querySelector('.shelf-dots');
  const shelfDots = shelfDotsWrap ? [...shelfDotsWrap.children] : [];
  const shelfCounter = document.querySelector('.shelf-count');
  const shelfPrev = document.querySelector('[data-shelf-prev]');
  const shelfNext = document.querySelector('[data-shelf-next]');
  const shelfVisible = () => shelfItems.filter(item => !item.hidden);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let shelfActive = null, shelfQueued = false, shelfQuiet = 0, shelfDetailTimer = 0, shelfDetailSlug = '';
  let shelfSuppressClick = false, shelfDrag = null, shelfResize = 0, shelfAnim = 0;
  // Browser-native smooth scrollIntoView gets cancelled by the per-frame inline style writes below,
  // so programmatic centering runs its own rAF animation over instant jumps.
  function shelfCenter(item, mode) {
    const target = Math.max(0, Math.min(shelfTrack.scrollWidth - shelfTrack.clientWidth,
      item.offsetLeft + item.offsetWidth / 2 - shelfTrack.clientWidth / 2));
    cancelAnimationFrame(shelfAnim);
    if (mode === 'instant' || reduceMotion.matches) { shelfTrack.scrollTo({left: target, behavior: 'instant'}); return; }
    const from = shelfTrack.scrollLeft, delta = target - from;
    if (Math.abs(delta) < 1) return;
    const start = performance.now(), duration = Math.min(520, 200 + Math.abs(delta) * 0.25);
    const step = now => {
      const progress = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - progress, 3);
      shelfTrack.scrollTo({left: from + delta * eased, behavior: 'instant'});
      shelfAnim = progress < 1 ? requestAnimationFrame(step) : 0;
    };
    shelfAnim = requestAnimationFrame(step);
  }
  function shelfCancelAnim() { cancelAnimationFrame(shelfAnim); shelfAnim = 0; }
  function shelfStyle(item, distance) {
    const clamped = Math.max(-1, Math.min(1, distance)), amount = Math.abs(clamped);
    item.style.setProperty('--tx', (clamped * -36).toFixed(2) + 'px');
    item.style.setProperty('--tz', ((1 - amount) * 120 - 120).toFixed(2) + 'px');
    item.style.setProperty('--rot', (clamped * -42).toFixed(2) + 'deg');
    item.style.setProperty('--op', Math.max(1 - amount * 0.35, 0.65).toFixed(3));
    item.style.setProperty('--zi', String(100 - Math.round(amount * 50)));
  }
  function shelfMeasure() {
    shelfQueued = false;
    const trackBox = shelfTrack.getBoundingClientRect();
    const center = trackBox.left + trackBox.width / 2, width = trackBox.width || 1;
    let best = null, bestGap = 2;
    shelfItems.forEach(item => {
      if (item.hidden) { if (item.getAttribute('style')) item.removeAttribute('style'); return; }
      const box = item.getBoundingClientRect();
      const distance = (box.left + box.width / 2 - center) / width * 2;
      shelfStyle(item, distance);
      if (Math.abs(distance) < bestGap) { bestGap = Math.abs(distance); best = item; }
    });
    if (best && best !== shelfActive) shelfSetActive(best);
  }
  function shelfRequestMeasure() { if (!shelfQueued) { shelfQueued = true; requestAnimationFrame(shelfMeasure); } }
  function shelfSetActive(item) {
    shelfActive = item;
    shelfItems.forEach(entry => { if (entry === item) entry.setAttribute('aria-current', 'true'); else entry.removeAttribute('aria-current'); });
    const visible = shelfVisible(), position = visible.indexOf(item);
    if (shelfPrev) shelfPrev.disabled = position <= 0;
    if (shelfNext) shelfNext.disabled = position >= visible.length - 1;
    for (let index = 0; index < shelfDots.length; index++) {
      if (!shelfDots[index]) continue;
      shelfDots[index].hidden = shelfItems[index] ? shelfItems[index].hidden : true;
      shelfDots[index].setAttribute('aria-selected', String(shelfItems[index] === item));
    }
    if (shelfCounter) shelfCounter.textContent = (position + 1) + ' / ' + visible.length;
    clearTimeout(shelfDetailTimer);
    shelfDetailTimer = setTimeout(() => {
      const template = shelfActive && shelfActive.querySelector('template.cover-detail');
      if (!template || shelfActive.dataset.slug === shelfDetailSlug) return;
      shelfDetailSlug = shelfActive.dataset.slug;
      // replacing the panel drops any focus inside it; refocus the same link (or its successor) afterwards
      const panelLinks = () => [...shelfPanel.querySelectorAll('a')];
      const focused = document.activeElement;
      const restore = shelfPanel.contains(focused) && focused.tagName === 'A'
        ? {href: focused.getAttribute('href'), index: panelLinks().indexOf(focused)} : null;
      shelfPanel.replaceChildren(template.content.cloneNode(true));
      if (restore) {
        const links = panelLinks();
        const restored = links.find(link => link.getAttribute('href') === restore.href) || links[restore.index];
        if (restored) restored.focus({preventScroll: true});
      }
    }, 200);
  }
  function shelfUpdateEdges() {
    const visible = shelfVisible();
    visible.forEach((item, index) => {
      item.classList.toggle('shelf-start', index === 0);
      item.classList.toggle('shelf-end', index === visible.length - 1);
    });
  }
  function shelfSync(state) {
    if (!shelf) return;
    shelfItems.forEach(item => { item.hidden = !matchesCard(item, state); });
    const visible = shelfVisible();
    shelf.hidden = visible.length === 0;
    if (!visible.length) return;
    shelfUpdateEdges();
    if (!shelfActive || shelfActive.hidden) shelfSetActive(visible[0]); else shelfSetActive(shelfActive);
    shelfCenter(shelfActive, 'instant');
    shelfRequestMeasure();
  }
  function update() {
    sortCards(cards, sort.value).forEach(card => grid.append(card));
    const state = {category, query:search.value, favoritesOnly:favoritesOnly.getAttribute('aria-pressed') === 'true', favorites};
    let count = 0;
    cards.forEach(card => { card.hidden = !matchesCard(card, state); if (!card.hidden) count++; });
    shelfSync(state);
    document.getElementById('visibleCount').textContent = `显示 ${count} / ${cards.length} 门`;
    document.getElementById('emptyState').hidden = count > 0;
  }
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = read(THEME);
  function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
  }
  setTheme(savedTheme === 'dark' || (!savedTheme && window.matchMedia?.('(prefers-color-scheme: dark)').matches));
  themeBtn.hidden = false;
  themeBtn.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    setTheme(dark);
    writeTheme(dark ? 'dark' : 'light');
  });
  categoryButtons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    categoryButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    update();
  }));
  favoriteButtons.forEach(button => button.addEventListener('click', () => {
    const slug = button.dataset.favorite;
    const next = new Set(favorites);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    if (write(FAVORITES, {version:1, slugs:[...next]})) { favorites = next; refreshFavorites(); update(); }
  }));
  favoritesOnly.addEventListener('click', () => {
    favoritesOnly.setAttribute('aria-pressed', String(favoritesOnly.getAttribute('aria-pressed') !== 'true'));
    update();
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    category = 'all'; search.value = ''; sort.value = 'curated';
    favoritesOnly.setAttribute('aria-pressed', 'false');
    categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
    update(); search.focus();
  });
  search.addEventListener('input', update);
  sort.addEventListener('change', update);
  window.addEventListener('storage', event => {
    if (event.key === FAVORITES) { refreshFavorites(); update(); }
    if (event.key === RECENT) refreshRecent();
    if (event.key === THEME) setTheme(event.newValue === 'dark');
  });
  if (shelf && shelfTrack && shelfItems.length) {
    shelfTrack.addEventListener('scroll', () => {
      shelfRequestMeasure();
      clearTimeout(shelfQuiet);
      shelfQuiet = setTimeout(shelfMeasure, 150);
    }, {passive: true});
    shelfTrack.addEventListener('scrollend', shelfMeasure);
    shelfTrack.addEventListener('wheel', shelfCancelAnim, {passive: true});
    shelfTrack.addEventListener('touchstart', shelfCancelAnim, {passive: true});
    shelfTrack.addEventListener('focusin', event => {
      const item = event.target.closest('.shelf-item');
      if (item && !item.hidden && item !== shelfActive) shelfCenter(item);
    });
    shelfTrack.addEventListener('keydown', event => {
      const visible = shelfVisible(), index = shelfActive ? visible.indexOf(shelfActive) : -1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const next = event.key === 'ArrowLeft' ? index - 1 : index + 1;
        if (next >= 0 && next < visible.length) shelfCenter(visible[next]);
      } else if (event.key === 'Home') {
        event.preventDefault();
        if (visible.length) shelfCenter(visible[0]);
      } else if (event.key === 'End') {
        event.preventDefault();
        if (visible.length) shelfCenter(visible[visible.length - 1]);
      } else if (event.key === 'Enter') {
        // a focused cover link keeps its native target; only bare-track Enter uses the centered course
        if (event.target.closest && event.target.closest('a.cover')) return;
        const cover = shelfActive && shelfActive.querySelector('a.cover');
        if (cover) { event.preventDefault(); location.href = cover.href; }
      }
    });
    shelfTrack.addEventListener('pointerdown', event => {
      shelfSuppressClick = false;
      shelfCancelAnim();
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      event.preventDefault();
      // preventDefault() also blocks native focus-on-click; hand the keyboard to the track instead
      shelfTrack.focus({preventScroll: true});
      shelfDrag = {x: event.clientX, left: shelfTrack.scrollLeft, moved: false};
    });
    function shelfEndDrag() {
      if (!shelfDrag) return;
      shelfDrag = null;
      shelfTrack.classList.remove('dragging');
      if (shelfSuppressClick) setTimeout(() => { shelfSuppressClick = false; }, 0);
    }
    window.addEventListener('pointermove', event => {
      if (!shelfDrag) return;
      // the button may be released outside the window: buttons==0 ends the drag
      if (!(event.buttons & 1)) { shelfEndDrag(); return; }
      const dx = event.clientX - shelfDrag.x;
      if (!shelfDrag.moved && Math.abs(dx) > 6) {
        shelfDrag.moved = true;
        shelfSuppressClick = true;
        shelfTrack.classList.add('dragging');
      }
      if (shelfDrag.moved) shelfTrack.scrollLeft = shelfDrag.left - dx;
    });
    window.addEventListener('pointerup', shelfEndDrag);
    window.addEventListener('pointercancel', shelfEndDrag);
    shelfTrack.addEventListener('click', event => {
      if (shelfSuppressClick) { shelfSuppressClick = false; event.preventDefault(); return; }
      const cover = event.target.closest('a.cover');
      if (!cover) return;
      const item = cover.closest('.shelf-item');
      if (item !== shelfActive) { event.preventDefault(); shelfCenter(item); }
    });
    window.addEventListener('resize', () => {
      clearTimeout(shelfResize);
      shelfResize = setTimeout(() => {
        if (shelfActive && !shelfActive.hidden) shelfCenter(shelfActive, 'instant');
        shelfRequestMeasure();
      }, 150);
    });
    if (shelfPrev) shelfPrev.addEventListener('click', () => {
      const visible = shelfVisible(), index = shelfActive ? visible.indexOf(shelfActive) : -1;
      if (index > 0) shelfCenter(visible[index - 1]);
    });
    if (shelfNext) shelfNext.addEventListener('click', () => {
      const visible = shelfVisible(), index = shelfActive ? visible.indexOf(shelfActive) : -1;
      if (index > -1 && index < visible.length - 1) shelfCenter(visible[index + 1]);
    });
    shelfDots.forEach((dot, index) => dot.addEventListener('click', () => {
      const item = shelfItems[index];
      if (item && !item.hidden) shelfCenter(item);
    }));
    if (shelfPrev) shelfPrev.hidden = false;
    if (shelfNext) shelfNext.hidden = false;
    if (shelfDotsWrap) shelfDotsWrap.hidden = false;
    if (shelfCounter) shelfCounter.hidden = false;
    const first = shelfVisible()[0];
    if (first) {
      shelfUpdateEdges();
      shelfDetailSlug = first.dataset.slug;
      shelfSetActive(first);
      shelfTrack.scrollLeft = 0;
      shelfRequestMeasure();
    }
  }
  document.getElementById('catalogTools').hidden = false;
  refreshFavorites(); refreshRecent(); update();
})();
