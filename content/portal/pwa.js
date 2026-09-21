(() => {
  'use strict';
  const supports = 'serviceWorker' in navigator && window.isSecureContext;
  const manager = document.getElementById('offline-manager');
  let installHost = document.getElementById('install-controls');
  let registration;
  let deferredInstall;
  let lastList;
  const courseMeta = document.querySelector('meta[name="jiadi-course"]');
  const currentSlug = courseMeta?.content || null;

  const style = document.createElement('style');
  style.textContent = '[data-pwa-ui] {font:13px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:inherit}[data-pwa-ui] button{border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;padding:5px 10px;min-height:36px;cursor:pointer;margin:3px}[data-pwa-ui] button:focus-visible,[data-pwa-ui] a:focus-visible{outline:3px solid currentColor;outline-offset:2px}[data-pwa-ui] ul{list-style:none;padding:0;margin:8px 0}[data-pwa-ui] li{padding:8px 0;border-top:1px solid #8d9b8d66}[data-pwa-ui] a{color:inherit;text-decoration:underline;text-underline-offset:3px}[data-pwa-ui] p{margin:4px 0}[data-pwa-ui] small{display:block;opacity:.75}[data-pwa-ui] details{margin-top:8px}';
  document.head.append(style);

  function bytesText(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '大小未知';
    return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  function message(action, slug, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const worker = registration?.active || navigator.serviceWorker.controller;
      if (!worker) { reject(new Error('离线服务尚未就绪')); return; }
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); reject(new Error('离线操作超时，请重试')); }, 120000);
      channel.port1.onmessage = event => {
        if (event.data?.progress) { onProgress(event.data.progress); return; }
        clearTimeout(timer);
        channel.port1.close();
        if (event.data?.ok) resolve(event.data.result);
        else reject(new Error(event.data?.error || '离线操作失败'));
      };
      worker.postMessage({ action, slug }, [channel.port2]);
    });
  }
  function statusLabel(item) {
    if (!item) return '状态未知';
    if (item.state === 'saved') return `已保存 · ${bytesText(item.bytes)}${item.updateAvailable ? ' · 有新版可更新' : ''}`;
    if (item.state === 'repair') return '缓存不完整，请重新保存修复';
    return '尚未保存到此浏览器';
  }
  function courseStatus(slug, text) {
    for (const node of document.querySelectorAll('[data-offline-status]')) if (node.dataset.offlineStatus === slug) node.textContent = text;
  }
  function actionStatus(slug, text, button) {
    courseStatus(slug, text);
    const managerNote = button.closest('li')?.querySelector('small');
    if (managerNote) managerNote.textContent = text;
  }
  function actionError(action, hadSaved, error) {
    const detail = String(error?.message || '');
    const lead = action === 'update' && hadSaved ? '更新未完成，原有离线副本仍可阅读。' : action === 'remove' ? '移除未完成。' : '保存未完成。';
    if (/quota|storage|space/i.test(detail)) return lead + '浏览器空间不足，请清理空间后重试。';
    if (/version|mismatch|identity/i.test(detail)) return lead + '网站文件正在更新，请联网刷新页面后重试。';
    if (/fetch|network|unavailable|asset/i.test(detail)) return lead + '无法取得完整课程文件，请检查网络后重试。';
    if (/超时|timeout/i.test(detail)) return lead + '操作超时，请稍后重试。';
    return lead + '请稍后重试。';
  }
  function updateHooks(items) {
    for (const item of items) {
      courseStatus(item.slug, statusLabel(item));
      for (const button of document.querySelectorAll('[data-offline-save], [data-offline-update], [data-offline-remove]')) {
        const action = button.hasAttribute('data-offline-save') ? 'save' : button.hasAttribute('data-offline-update') ? 'update' : 'remove';
        if (button.dataset[`offline${action[0].toUpperCase()}${action.slice(1)}`] !== item.slug) continue;
        button.hidden = action === 'save' ? item.state === 'saved' : item.state !== 'saved' || (action === 'update' && !item.updateAvailable);
      }
    }
  }
  const element = (tag, text, attrs = {}) => { const node = document.createElement(tag); node.textContent = text; for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
  function renderManager(items) {
    if (!manager) return;
    const content = manager.querySelector('[data-offline-manager-content]') || manager;
    content.replaceChildren();
    manager.setAttribute('data-pwa-ui', '');
    content.append(element('strong', '已保存的课程'));
    const relevant = items.filter(item => item.state === 'saved' || item.state === 'repair');
    if (!relevant.length) { content.append(element('p', '这里还没有完整保存的课程。')); return; }
    const list = document.createElement('ul');
    for (const item of relevant) {
      const row = document.createElement('li');
      if (item.state === 'saved') row.append(element('a', item.title || item.slug, { href: `/courses/${item.slug}/index.html` }));
      else row.append(element('strong', item.title || item.slug));
      row.append(element('small', statusLabel(item)));
      row.append(element('button', item.state === 'repair' ? '重新保存' : '更新缓存', { type: 'button', 'data-offline-update': item.slug }));
      row.append(element('button', '移除', { type: 'button', 'data-offline-remove': item.slug }));
      list.append(row);
    }
    content.append(list, element('p', '离线缓存可能被浏览器清理；独立 HTML 下载可作为自己的副本。'));
  }
  async function refresh() {
    const result = await message('list');
    lastList = result;
    updateHooks(result.courses);
    renderManager(result.courses);
  }
  function ensureCourseControls() {
    if (!currentSlug || document.querySelector(`[data-offline-status="${currentSlug}"]`)) return;
    const anchor = document.querySelector('.portal-course-nav') || document.querySelector('.portal-home')?.closest('header') || document.querySelector('.portal-home')?.parentElement;
    if (!anchor) return;
    const controls = element('aside', '', { 'data-pwa-ui': '', 'aria-label': '课程离线阅读' });
    const details = document.createElement('details');
    details.append(element('summary', '离线阅读'));
    details.append(element('button', '保存供离线阅读', { type: 'button', 'data-offline-save': currentSlug }));
    details.append(element('button', '更新离线课程', { type: 'button', 'data-offline-update': currentSlug, hidden: '' }));
    details.append(element('button', '移除离线副本', { type: 'button', 'data-offline-remove': currentSlug, hidden: '' }));
    details.append(element('span', '正在检查离线状态…', { 'data-offline-status': currentSlug, role: 'status' }));
    controls.append(details);
    anchor.insertAdjacentElement('afterend', controls);
  }
  function updateNotice() {
    if (!registration?.waiting) return;
    const host = installHost || manager || document.querySelector('[data-pwa-ui]');
    if (!host || host.querySelector('[data-pwa-update-notice]')) return;
    host.append(element('p', '网站有新版。请关闭所有本站页面后重新打开；当前阅读不会被强制刷新。', { 'data-pwa-update-notice': '', role: 'status' }));
  }
  function installControls() {
    if (!installHost && !deferredInstall && !/iPhone|iPad|iPod/.test(navigator.userAgent) && !registration?.waiting) return;
    if (!installHost) {
      installHost = document.createElement('div');
      const target = document.querySelector('[data-pwa-ui]');
      target?.insertAdjacentElement('afterend', installHost);
    }
    if (!installHost) return;
    installHost.setAttribute('data-pwa-ui', '');
    if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !installHost.querySelector('details')) {
      const details = document.createElement('details');
      details.append(element('summary', '在 iPhone / iPad 上安装'));
      details.append(element('p', '在 Safari 中点“分享”，再选“添加到主屏幕”。安装由浏览器完成。'));
      installHost.append(details);
    }
    updateNotice();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event;
    installControls();
    if (!installHost || installHost.querySelector('[data-pwa-install]')) return;
    installHost.append(element('button', '安装学习站', { type: 'button', 'data-pwa-install': '' }));
  });
  window.addEventListener('appinstalled', () => {
    installHost?.querySelector('[data-pwa-install]')?.remove();
    deferredInstall = null;
  });
  document.addEventListener('click', async event => {
    const target = event.target.closest?.('button');
    if (!target) return;
    if (target.hasAttribute('data-pwa-install')) {
      if (!deferredInstall) return;
      const prompt = deferredInstall;
      deferredInstall = null;
      target.remove();
      await prompt.prompt();
      return;
    }
    const action = target.hasAttribute('data-offline-save') ? 'save' : target.hasAttribute('data-offline-update') ? 'update' : target.hasAttribute('data-offline-remove') ? 'remove' : null;
    if (!action) return;
    const slug = target.getAttribute(`data-offline-${action}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return;
    const hadSaved = lastList?.courses.some(item => item.slug === slug && item.state === 'saved') || false;
    target.disabled = true;
    actionStatus(slug, action === 'remove' ? '正在移除…' : action === 'update' ? '正在更新…' : '正在保存…', target);
    try {
      await ready;
      await message(action, slug, progress => actionStatus(slug, `正在保存 ${progress.completed}/${progress.total} 个文件 · ${bytesText(progress.bytes)}`, target));
      await refresh();
    } catch (error) { actionStatus(slug, actionError(action, hadSaved, error), target); }
    finally { target.disabled = false; }
  });
  ensureCourseControls();
  installControls();
  if (!supports) {
    const note = '此浏览器环境暂不支持离线保存。';
    for (const node of document.querySelectorAll('[data-offline-status]')) node.textContent = note;
    if (manager) (manager.querySelector('[data-offline-manager-content]') || manager).textContent = note;
    return;
  }
  const ready = navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(async reg => {
    registration = reg;
    reg.addEventListener('updatefound', () => reg.installing?.addEventListener('statechange', updateNotice));
    await navigator.serviceWorker.ready;
    updateNotice();
    await refresh();
    return reg;
  }).catch(() => {
    const note = '离线服务暂不可用，请联网刷新页面后重试。';
    for (const node of document.querySelectorAll('[data-offline-status]')) node.textContent = note;
    if (manager) (manager.querySelector('[data-offline-manager-content]') || manager).textContent = note;
    return null;
  });
})();
