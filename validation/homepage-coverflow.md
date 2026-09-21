# 主页封面流（Cover Shelf）验收记录

日期：2026-09-21 · 分支：`worktree-coverflow-spec`（基于 origin/main `c390e58`）
范围：`templates/home.html`、`scripts/catalog.mjs`、`content/portal/home.css`、`content/portal/home.js`、`scripts/check.mjs`（spec：`docs/coverflow-spec.md`）

## 移植说明（重要）

spec 撰写时主页仍是单文件内联架构。实施期间远端 main 合入了 PR #1–#4（PWA、品牌、浅色默认、第 15 门课程 outlive-guided-full，主页重构为外置 `assets/portal/home.css` / `home.js`）。本实现按 spec 意图移植到新架构：

- 封面/圆点/详情模板由 `scripts/catalog.mjs` 生成（`COURSE_COVERS` / `SHELF_DOTS` / `SHELF_DETAIL_INITIAL` / `SHELF_CLASS` 占位符，经既有 `renderCatalog()` spread 进替换表；`build.mjs` 零改动）。
- 链接改为站内绝对路径（`/courses/…`、`/assets/previews/…`），与新架构一致；CSP 未变（封面流 JS 位于外置 `home.js`，属 `script-src 'self'`，不新增哈希）。
- 移动端断点由 spec 的 740px 改为站点现行的 680px；金色顶边用现行 `--focus` 变量（站点已无 `--gold`）。
- 封面流筛选/搜索沿用新 `update()` 的同一 `matchesCard`（含「只看收藏」语义）；排序下拉只重排网格，封面流按 spec 固定最新在前。
- 详情面板按 spec §2 保留完整信息（网格卡片的描述/建议起点已移入折叠详情，面板仍完整展示）。

## 静态检查

- `npm test` 全套通过：**137 项静态检查**（基线 131 + 新增 6 项封面流断言）+ test-home / test-resume / test-theme-defaults / test-platform 全部 PASS。
- 网格不变：改前/改后 `public/index.html` 的 `<div class="course-grid">…</section>` 区域字节完全相同（46,522 字节）；`content/portal/home.css` 改动为纯追加（0 删除），网格既有规则未动。
- 课程源文件、下载、笔记、SW 打包逻辑均未改（sw.js 仅因资产哈希戳自动更新）。
- 远端 PR #4 重划了分类：「策略与风险」分类已不存在（其配色规则保留备用，check 仅在缺失时告警）。

## 浏览器验收（本地 HTTP `npm run preview`，Chromium / Windows）

环境说明：ZCode 内置浏览器（Chromium）。本会话浏览器自动化环境出现两类间歇故障（与站点代码无关，见「环境怪癖」），关键路径均改用页面内事件派发复核。

| # | 项目 | 结果 |
|---|---|---|
| 1 | 1440 初始状态 | ✅ 最新课程（outlive-guided-full）精确居中（偏移 0px），面板/计数 1/15/prev 禁用；15 圆点；倾斜变量正确（第 3 项 rot -28.25°、opacity 0.76） |
| 1 | 键盘 →/End/Home/Enter | ✅ 全部精确到位（offCenter=0），End 后 next 禁用；Enter 进入当前课程；边界按钮禁用正确 |
| 1 | prev/next 按钮、圆点 | ✅ 精确居中，`aria-selected`/计数同步 |
| 1 | 鼠标拖动 | ✅ scrollLeft 0→576 吸附到第 4 项，无误跳转 |
| 1 | 点击非居中/居中封面 | ✅ 先居中不跳转；居中后点击进入课程 |
| 1 | 横向滚轮 | ⚠️ 本会话输入管线不稳定未复现；旧架构会话已验证（576→1728），该路径为浏览器原生滚动（无 JS 参与），CSS 未变 |
| 2 | 390 宽 | ✅ 圆点隐藏、显示 "n / 15" 文本计数；active 居中；768/1024 圆点正常 |
| 3 | Safari / 真机触摸 | ❌ 本机无 macOS/iOS/触摸屏，未覆盖 |
| 4 | 深色/浅色截图 | ✅ `validation/evidence/coverflow-{light,dark}-1440.png`；封面底色按分类切换，文字对比度正常（视觉模型核验通过） |
| 5 | prefers-reduced-motion | ⚠️ 接口无法仿真；已核对 CSS（transform:none/opacity:1/scroll-behavior:auto）与 JS `shelfCenter` 的 reduce→instant 分支 |
| 6 | 筛选「健康与科学」 | ✅ 封面流与网格同为 6 门（PR #4 重分类后），逆序，active 重置居中，计数 1/6，圆点同步隐藏 |
| 6 | 搜索 0 结果 ↔ 清空 | ✅ 封面流整体隐藏 + 空状态；清空恢复 15 门且 active 重新居中 |
| 6 | 排序下拉 | ✅ 网格按标题重排，封面流保持最新在前 |
| 7 | CSP / SW | ✅ 外置 `home.js` 走 `script-src 'self'`，无新内联哈希；带 `?v=` 资产戳的 SW 管线在 test-platform 覆盖 |
| 8 | Tab 顺序 | ✅ 旧架构会话验证：CTA → 封面流按钮（禁用跳过）→ track → 封面（聚焦自动居中）→ 圆点 → 筛选/网格；新架构 DOM 顺序一致 |
| 9 | 网格与改前一致 | ✅ 网格 HTML 字节相同 + home.css 纯追加 + 几何/视觉一致 |

## 实施中发现并修复的问题（跨两次实现）

1. **Chromium 平滑 `scrollIntoView` 会被逐帧内联样式写入中断**（首次实现：Home 卡在第 12 项；实验证实屏蔽 `setProperty` 后可完整到达）。修复：程序化居中改为自绘 rAF 动画（每帧 `scrollTo({behavior:'instant'})`），目标用 `offsetLeft` 计算（track 加 `position:relative`），滚轮/指针/触摸可取消；reduce 时瞬移。
2. **筛选后未重新居中 active + 无位移滚动不触发事件导致倾斜变量过期**（首次实现：恢复后偏 192px / 残留 -7px）。修复：每次目录更新后统一 `shelfCenter(active,'instant') + requestMeasure()`。

## 环境怪癖（如实记录，非站点问题）

- 内置浏览器标签页在一段时间/若干次 evaluate 后 rAF 可能整体暂停且原生 scroll 事件停止派发（连独立对照元素亦然）；换新标签页即恢复。期间观察到的一次 Home 动画停滞即由此造成，同一代码在健康标签页复核完整到达第 1 项。
- `press()`/`type()` 等可信输入偶发不送达页面；键盘路径改用页面内 `KeyboardEvent` 派发复核（处理器链真实执行）。

## 未覆盖项

- Safari（macOS/iOS）与真实触摸惯性；`prefers-reduced-motion` 浏览器实测；屏幕阅读器朗读（aria-live 结构已实现）。
- 线上 HTTPS/Cloudflare：待推送后 `npm run verify:live`（结果追加于下）。

## 线上验证（已完成）

- [x] Workers Builds 检查通过（commit `de910e5`，`Workers Builds: interactivelearning` = success，2026-09-21）
- [x] `npm run verify:live` 通过（普通网络）：Verified live at https://learning.jiadi.ai — homepage, 15 courses, hashes, downloads and 404（退出码 0；Cloudflare 边缘注入按既有流程移除后比对）

## 缺陷修复轮（2026-09-21，用户确认的 5 项缺陷 + 桌面侧边按钮）

1. **面板统计粘连**：`.shelf-detail .course-stats` 补 `display:flex;gap:14px;flex-wrap:wrap`（新架构网格仅剩单项统计，flex 排版已被删除）。实测 computed display=flex、gap=14px，三项「32 个学习站 / 64 项核查记录 / 35 个术语」分开排列。
2. **点击封面后键盘不接管**：`pointerdown` 的 `preventDefault()` 连带阻止了原生点击聚焦；补 `shelfTrack.focus({preventScroll:true})`。可信鼠标点击 track 后实测 `activeElement` 为 track。
3. **Enter 进错课**：track keydown 不再拦截 `event.target` 为 `a.cover` 的 Enter，交给链接原生行为。可信 Enter 实测打开的是**聚焦**的那门课（healthy-masculinity，非此前居中的 outlive）。
4. **面板替换吞焦点**：替换前记录面板内焦点链接的 href 与序号，替换后优先按 href、否则按同类同位（CTA 位）回焦。实测焦点从旧 CTA 转移到新面板的 CTA，不再掉回 body。
5. **拖动残留**：`pointermove` 增加 `event.buttons` 检查（窗口外松开即结束），新增 `pointercancel` 监听；两者均实测清掉 dragging 类，后续点击不被误抑制。
6. **侧边切换按钮（新）**：「上一门/下一门」从顶部行改为封面流两侧上下居中的透明按钮 + 大三角（CSS border 三角，零新资产），z-index 置顶，禁用态淡化；`aria-label` 保留。截图 `validation/evidence/coverflow-side-buttons-1440.png`；check 的无 JS 断言已同步新标记。

`npm test` 全套通过（137 项静态 + 4 套）。线上验证（本次修复后）：commit `cb96624` Workers Builds success；`npm run verify:live` 通过（Verified live at https://learning.jiadi.ai，退出码 0）。

---

## 第二轮改进（2026-09-21）

分支 `worktree-coverflow-spec`（基线 `fd1d408`）。评审提出的 8 项改进全部实施，范围仍限于 `templates/home.html`、`scripts/catalog.mjs`、`content/portal/home.css`、`content/portal/home.js`、`scripts/check.mjs`。课程源文件、`courses.json`、网格模板与下载字节均未改动。

### 八项改动

| # | 改动 | 文件 |
|---|---|---|
| 1 | **不透明压暗替代 opacity**。封面恢复完全不透明，侧边"后退感"改由 `.shelf-item::after` 覆盖层表达，alpha 跟随 JS 写入的 `--dim`（中心 0 → 边缘 0.35；`body.dark` 下 ×1.45 的纯黑）。`--op` 变量已删除；reduced-motion 分支保持平铺且 `--dim` 强制为 0 | `home.css`、`home.js` |
| 2 | **≤680px 移动端紧凑化**。封面 220→180px（仍 3:4，实测 180×240），track 内边距 12/26 → 8/16；详情面板只保留「分类 · 版本 / 标题 / 副标题 / 动作行」，`.description`、`.tags`、`.course-stats`、`.course-tip` 在该断点 `display:none`（模板未改，check 断言不受影响） | `home.css` |
| 3 | **图片优先级**。首张（最新、初始居中）封面 `loading="eager" fetchpriority="high"`，第 2、3 张 `loading="eager"`，其余保持 `loading="lazy"` | `catalog.mjs` |
| 4 | **Roving tabindex**。只有当前居中的封面链接 `tabindex="0"`，其余 `-1`；`ul.shelf-track` 不再 `tabindex="0"`；键盘 ←/→/Home/End 时焦点随之移动（鼠标/触摸滚动不移焦点）。初始值由 `catalog.mjs` 渲染，无 JS 时首张封面仍可聚焦，每张封面仍是真链接 | `home.html`、`catalog.mjs`、`home.js` |
| 5 | **圆点语义**。`role="tablist"`/`role="tab"`/`aria-selected` → `role="group"` + `aria-pressed` 的普通按钮；只有当前圆点 `tabindex="0"`（整组一个 Tab 位，←/→ 在组内移动）；CSS 选择器与 check 断言同步 | `home.html`、`catalog.mjs`、`home.css`、`home.js`、`check.mjs` |
| 6 | **状态朗读行**。`.shelf-detail` 去掉 `aria-live="polite"`；新增视觉隐藏的 `<p class="sr-only" id="shelfStatus" role="status" aria-live="polite">`，与面板同批 200ms 去抖写入 `当前：<标题>（第 n / N 门）`。`home.css` 原本没有 `.sr-only`，本轮新增该工具类。面板原有的焦点恢复逻辑保留 | `home.html`、`home.css`、`home.js` |
| 7 | **测量不再逐帧读布局**。`shelfMeasure` 不再对每个（已被 transform 过的）元素调用 `getBoundingClientRect`；改为在 init／resize／每次筛选后由 `shelfRemeasure()` 缓存各可见项的未变换中心（`offsetLeft + offsetWidth/2`）与 `clientWidth`，每帧只读 `shelfTrack.scrollLeft` 再写 CSS 变量。`shelfCenter` 仍用 `offsetLeft` | `home.js` |
| 8 | **侧边按钮 DOM 顺序**。「上一门」移到 `<ul>` 之前、「下一门」移到之后（二者仍为绝对定位，视觉不变），Tab 顺序成为 prev → 封面 → next | `home.html`、`check.mjs` |

### 静态检查

- `npm test` 全套通过：**139 项静态检查**（上一轮 137 + 新增 2 项）+ test-home / test-resume / test-theme-defaults / test-platform 全部 PASS。
- 新增断言：①「shelf keeps one Tab stop per group and prioritises the centred cover image」——封面数 = 课程数、恰好 1 张封面 `tabindex="0"` 且为最新那张、其余 `-1`、track 无 `tabindex`、首图 eager+high、第 2–3 图 eager、其余 lazy、圆点无 `role="tab"`/`aria-selected`、恰好 1 个 `aria-pressed="true"` 与 1 个 `tabindex="0"`；②「centred course is announced through a dedicated status line」——`#shelfStatus` 存在、面板不再是 live region、`.sr-only` 工具类与 JS 写入存在。
- 原有断言扩展：「shelf controls stay hidden until JavaScript runs」增加 prev 在 `<ul>` 之前、next 在之后的 DOM 顺序断言。
- **网格未变**：改前基线 `public/index.html` 的 `<div class="course-grid"…</section>` 区域 32,256 字节、SHA-256 `42c5377630c1ef1e3dfcc61ef46d31a1e52c655017571dcc3295599ebdcc8d43`，改后逐字节相同。`content/courses/` 无任何改动。
- 无新增 `localStorage` 键、无 `fetch`/XHR、无第三方依赖；JS 仍全部在外置 `content/portal/home.js`（`script-src 'self'`），CSP 未变。

### 浏览器验收（本地 HTTP `node scripts/serve.mjs --port 4173`，Chromium via chrome-devtools MCP）

| 项目 | 1440 宽 | 390 宽 |
|---|---|---|
| 初始居中偏移 | ✅ 0px | ✅ 0px |
| 封面不透明 / 压暗 | ✅ `opacity: 1`，`--dim` 0 / 0.118 / 0.235 / 0.350；倾斜角与上一轮完全相同（0 / -14.12° / -28.25° / -42.00°） | ✅ 同上 |
| 深色模式 | ✅ 压暗层 `rgb(0,0,0)`，边缘 alpha 0.5075；截图 `evidence/coverflow-r2-1440-dark.png` | ✅ 计算值核对通过（未单独截图） |
| Shelf 内 Tab 位 | ✅ 共 3 个（封面 ×1、next 按钮、当前圆点；prev 在首项时 disabled 被跳过）；改前为 16（track + 15 封面）。真实 Tab 键实测顺序：主题按钮 → 封面 → 下一门 → 圆点 | — |
| ←/→ | ✅ 第 1→2 门，偏移 0，焦点随动，状态行「当前：无条件养育 · 一起读（第 2 / 15 门）」 | ✅ 偏移 0，焦点随动，计数 6 / 15 |
| End / Home | ✅ End→第 15 门（next 禁用）、Home→第 1 门（scrollLeft 0、prev 禁用），偏移均为 0 | — |
| 聚焦封面上按 Enter | ✅ 打开的是**聚焦**的那门课（`/courses/unconditional-parenting/index.html`），不是此前居中的那门 | — |
| 点击非居中封面 | ✅ 先居中（偏移 0）且不跳转，焦点落到该封面（`tabIndex` 变为 0），状态行同步 | — |
| prev / next / 圆点 | ✅ 三者均精确居中（偏移 0），`aria-pressed` 与圆点序号同步 | — |
| 滚动不夺焦点 | ✅ 焦点在搜索框时程序化滚动 track，active 与状态行更新，`document.activeElement` 保持不变 | — |
| 筛选「健康与科学」 | ✅ 封面 15→6，active 保留且重新居中（偏移 0），可见封面中恰好 1 张可 Tab，圆点同步 6 个 | — |
| 搜索 0 结果 → 清除 | ✅ 整个 `.shelf` 隐藏 + 空状态显示；清除后恢复 15 门、重新居中、Tab 位回到 1 | — |
| Shelf 区块高度 | 839px（与上一轮一致） | ✅ **473px**（首门课）；遍历全部 15 门课的最坏情况 **518px**，均低于 560px 目标（改前约 861px） |
| 移动端紧凑面板 | — | ✅ `.description` / `.tags` / `.course-stats` / `.course-tip` 计算样式 `display:none`，`.course-actions` 为 `flex`；封面 180×240；圆点隐藏、显示 "1 / 15" |
| 控制台 | ✅ 无 error/warning。仅 2 条非错误项：DevTools issue「Lazy-loaded images should have explicit dimensions」（既有，网格图片）与 PWA 安装横幅 info | ✅ 同上 |
| 截图 | `evidence/coverflow-r2-1440.png`（浅色） | `evidence/coverflow-r2-390.png`（浅色） |

### 本轮未覆盖

- Safari（macOS/iOS）与真实触摸惯性滚动：本机无 macOS/iOS 设备或触摸屏。
- `prefers-reduced-motion: reduce` 的浏览器实测：chrome-devtools MCP 的 `emulate` 不提供该项仿真；仅核对了 CSS 分支（`transform:none!important` + `.shelf-item::after{opacity:0!important}`）。
- 屏幕阅读器实际朗读（NVDA/VoiceOver）：仅验证了 `role="status" aria-live="polite"` 结构与文本按 200ms 去抖写入。
- 390 宽深色模式截图：只核对了计算样式，未单独出图。
- 线上 HTTPS：本轮为 draft PR，未合并、未推送 `main`，因此**未**运行 `npm run verify:live`（按 AGENTS.md 第 6 条，部署后才有意义）。
