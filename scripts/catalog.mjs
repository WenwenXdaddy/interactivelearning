const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

export const routes = [
  {
    title: '从投资判断走向风险边界',
    reason: '先辨认无法列举的状态，再看黄金期权如何把收益与尾部风险放在同一本账上。',
    slugs: ['unknown-unknowable', 'gold-volatility']
  },
  {
    title: '从读过走向做成',
    reason: '先看学习工具何时失效，再练习把内心阻力拆成可开始的行动。',
    slugs: ['why-learning-tools-fail', 'overcome-inner-resistance']
  }
];

export function renderCatalog(courses) {
  const names = new Map(courses.map(course => [course.slug, course.title]));
  const filters = [...new Set(courses.map(course => course.category))]
    .map(category => `<button class="filter" type="button" data-filter="${escape(category)}" aria-pressed="false">${escape(category)}</button>`).join('');
  const cards = courses.map((course, index) => {
    const {slug} = course;
    const search = [course.title, course.subtitle, course.description, course.category, ...course.tags].join(' ');
    return `<article class="course ${escape(course.tone)}" data-slug="${escape(slug)}" data-category="${escape(course.category)}" data-search="${escape(search)}" data-curated="${index}" data-added="${escape(course.sourceAddedAt || '')}" data-updated="${escape(course.sourceUpdatedAt || '')}">
      <div class="course-visual"><img src="/assets/previews/${escape(slug)}.webp" alt="${escape(course.imageAlt)}" width="1120" height="960" loading="lazy"></div>
      <div class="course-content">
        <div class="course-kicker"><span>${escape(course.category)}</span><button class="favorite" type="button" data-favorite="${escape(slug)}" aria-label="收藏${escape(course.title)}" aria-pressed="false" hidden><span aria-hidden="true">☆</span><span>收藏</span></button></div>
        <h3>${escape(course.title)}</h3><p class="subtitle">${escape(course.subtitle)}</p>
        <div class="course-stats"><span>${escape(course.chapters)} 个学习站</span></div>
        <div class="course-actions"><a class="cta" href="/courses/${escape(slug)}/index.html">进入课程 <span aria-hidden="true">↗</span></a><button type="button" class="save-course" data-offline-save="${escape(slug)}" hidden>保存供离线阅读</button><span class="offline-status" data-offline-status="${escape(slug)}" role="status"></span></div>
        <details class="course-details"><summary>课程详情与下载</summary><div class="course-more"><p>${escape(course.description)}</p><div class="tags">${course.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div><p>版本：${escape(course.version)} · ${escape(course.metric)} · ${escape(course.terms)} 个术语</p><p><strong>建议起点：</strong>${escape(course.firstTask)}</p><div class="download-links"><a href="/courses/${escape(slug)}/study-notes.md" download="${escape(slug)}-study-notes.md">学习手册 ↓</a><a href="/downloads/${escape(slug)}.html" download="${escape(slug)}.html">独立 HTML ↓</a></div></div></details>
      </div>
    </article>`;
  }).join('\n');
  const curated = routes.map(route => {
    if (route.slugs.some(slug => !names.has(slug))) throw new Error('Curated route references an unknown course');
    return `<article class="route"><h3>${escape(route.title)}</h3><p>${escape(route.reason)}</p><ol>${route.slugs.map(slug => `<li><a href="/courses/${escape(slug)}/index.html">${escape(names.get(slug))}</a></li>`).join('')}</ol></article>`;
  }).join('');
  // Cover shelf: newest course first and initially centered. Pure-CSS cover faces reuse the preview
  // screenshots; the detail template carries the full course copy so the panel needs no extra request.
  const newestFirst = [...courses].reverse();
  const shelfDetail = course => {
    const {slug} = course;
    return `<div class="course-kicker"><span>${escape(course.category)} · ${escape(course.version)}</span></div>
<h3>${escape(course.title)}</h3><p class="subtitle">${escape(course.subtitle)}</p>
<p class="description">${escape(course.description)}</p>
<div class="tags">${course.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div>
<div class="course-stats"><span>${course.chapters} 个学习站</span><span>${escape(course.metric)}</span><span>${course.terms} 个术语</span></div>
<div class="course-actions"><a class="cta" href="/courses/${escape(slug)}/index.html">进入课程 <span aria-hidden="true">↗</span></a><div class="download-links"><a href="/courses/${escape(slug)}/study-notes.md" download="${escape(slug)}-study-notes.md">学习手册 ↓</a><a href="/downloads/${escape(slug)}.html" download="${escape(slug)}.html">独立 HTML ↓</a></div></div>
<p class="course-tip"><strong>建议起点</strong> · ${escape(course.firstTask)}</p>`;
  };
  const covers = newestFirst.map((course, index) => {
    const {slug} = course;
    const search = [course.title, course.subtitle, course.description, course.category, ...course.tags].join(' ');
    // The newest cover is centred on load, so it is the LCP candidate; its two neighbours are partly
    // visible either side. Everything further out stays lazy.
    const priority = index === 0 ? 'loading="eager" fetchpriority="high"' : (index < 3 ? 'loading="eager"' : 'loading="lazy"');
    // Roving tabindex: only the active cover is in the Tab order. Rendered here so that without
    // JavaScript the first (centred) cover is still focusable and every cover stays a real link.
    return `<li class="shelf-item" data-slug="${escape(slug)}" data-category="${escape(course.category)}" data-search="${escape(search)}">
<a class="cover" href="/courses/${escape(slug)}/index.html" tabindex="${index === 0 ? '0' : '-1'}" aria-label="${escape(course.title)}：${escape(course.subtitle)}"><span class="cover-mat" data-tone="${escape(course.tone)}"><span class="cover-category">${escape(course.category)}</span><strong class="cover-title">${escape(course.title)}</strong><span class="cover-meta">${course.chapters} 站 · ${course.terms} 术语</span></span><img class="cover-thumb" src="/assets/previews/${escape(slug)}.webp" alt="" width="1120" height="960" ${priority}></a>
<template class="cover-detail">${shelfDetail(course)}</template></li>`;
  }).join('\n');
  const dots = courses.length <= 20
    ? newestFirst.map((course, index) => `<button class="shelf-dot" type="button" aria-pressed="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}" aria-label="${escape(course.title)}"></button>`).join('')
    : '';
  return {FILTERS: filters, COURSE_CARDS: cards, CURATED_ROUTES: curated,
    COURSE_COVERS: covers, SHELF_DOTS: dots, SHELF_DETAIL_INITIAL: shelfDetail(newestFirst[0]),
    SHELF_CLASS: courses.length > 20 ? ' shelf-countonly' : ''};
}
