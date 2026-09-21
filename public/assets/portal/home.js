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
  function update() {
    sortCards(cards, sort.value).forEach(card => grid.append(card));
    const state = {category, query:search.value, favoritesOnly:favoritesOnly.getAttribute('aria-pressed') === 'true', favorites};
    let count = 0;
    cards.forEach(card => { card.hidden = !matchesCard(card, state); if (!card.hidden) count++; });
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
  document.getElementById('catalogTools').hidden = false;
  refreshFavorites(); refreshRecent(); update();
})();
