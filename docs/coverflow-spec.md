# 主页封面流（Cover Flow）规格

状态：**待用户确认，未实施**
日期：2026-09-21
范围：仅门户主页（`templates/home.html`、`scripts/build.mjs`、`scripts/check.mjs`）。课程源文件、课程脚本、`courses.json` 字段、预览截图字节全部不动。

已确认的三项决策：

| 决策 | 结论 |
|---|---|
| 形态 | 混合：主页课程区顶部增加封面流，下方保留现有筛选、搜索与双列网格 |
| 封面 | 先用纯 CSS 卡面（色底 + 标题 + 分类 + 截图缩略），不生成新图片 |
| 依赖 | 零依赖。原生横向滚动 + `scroll-snap`，内联 JS 计算倾斜；不引入 Swiper 或任何第三方包 |

---

## 1. 目标与非目标

**目标**

- 让主页第一眼有「翻封面」的展示感，同时不损失现在网格的可扫描性与筛选能力。
- 触摸、鼠标拖动、滚轮、键盘、prev/next 按钮都能翻页；居中的封面自动成为「当前课程」，下方面板显示它的完整信息与三个动作。
- 保持站点既有承诺：静态、零依赖、CSP 不放宽、无遥测、无 `fetch`。

**非目标**

- 不替换网格，不改网格卡片模板。
- 不生成新的封面图片资源（后续可选，见 §9）。
- 不做无限循环（loop）。14 门课首尾各有明确边界即可。
- 不做倒影、灯光等 Three.js 类效果。
- 不改任何课程页面、`au-lab-*` 等存储键、下载文件字节。

---

## 2. 页面结构

在 `<section id="courses">` 内，`section-heading` 之后、`catalog-tools` 之前插入封面流区块。DOM 顺序即阅读顺序：

```
section#courses
├─ .section-heading                （现有）
├─ noscript                        （现有）
├─ .shelf                          （新增：封面流）
│  ├─ .shelf-head
│  │  ├─ p.eyebrow  "COVER SHELF · 最新在前"
│  │  └─ .shelf-nav  [‹ 上一门] [下一门 ›]   type=button
│  ├─ ul.shelf-track   role=list  tabindex=0  aria-roledescription="封面流"  aria-label="课程封面流，按左右方向键切换"
│  │  └─ li.shelf-item ×N   data-slug  data-category  data-search
│  │     └─ a.cover  href="courses/<slug>/index.html"  aria-label="<title>：<subtitle>"
│  │        ├─ .cover-mat            （色底，按分类着色）
│  │        │  ├─ span.cover-category
│  │        │  ├─ strong.cover-title
│  │        │  └─ span.cover-meta   "<chapters> 站 · <terms> 术语"
│  │        └─ img.cover-thumb  src=assets/previews/<slug>.webp  alt=""  loading=lazy  width=1120 height=960
│  ├─ .shelf-dots     role=tablist（仅 ≥741px 显示，≤14 个点；超过 20 门课时改为 "3 / 21" 文本）
│  └─ .shelf-detail   aria-live=polite  （当前课程面板）
│     ├─ .course-kicker    分类 · 版本
│     ├─ h3                标题
│     ├─ p.subtitle
│     ├─ p.description
│     ├─ .tags
│     ├─ .course-stats     N 个学习站 · metric · N 个术语
│     ├─ .course-actions   [进入课程 ↗] [学习手册 ↓] [离线 HTML ↓]
│     └─ p.course-tip      建议起点
├─ .catalog-tools                  （现有：筛选 + 搜索）
├─ #resultStatus / #emptyState     （现有）
└─ .course-grid                    （现有网格，模板不变）
```

**顺序**：封面流按 `courses.json` **逆序**（最新课程在最左、初始居中）。网格保持现有顺序不变。

**当前课程面板的数据来源**：不额外请求、不复制文本。每个 `li.shelf-item` 内放一个 `<template class="cover-detail">`，由 build 生成，内容与网格卡片的 `.course-content` 相同；JS 在切换时把模板内容克隆进 `.shelf-detail`。这样文案只在 build 时来自 `courses.json` 一处，页面不需要 JSON 内联。

无 JS 时：`.shelf-track` 就是一个可横向滚动的封面列表，每个封面本身是链接，可点进课程；`.shelf-detail` 显示第一门（最新）课程的模板内容（build 时直接渲染一份，JS 加载后接管）；prev/next 与圆点隐藏（`hidden` 属性，JS 移除）。

---

## 3. 视觉规格

### 3.1 封面卡面（纯 CSS，不新增图片）

- 尺寸：桌面 `--cover-w: 300px`，比例 3:4（300×400）；≤1000px 260×347；≤740px 220×293。
- 层次：`.cover-mat` 占满，顶部 60% 是色底与文字，底部 40% 放 `img.cover-thumb`（`object-fit: cover; object-position: top left`），截图只作纹理，倾斜后不要求可读。
- 文字：`cover-category` 11px 大写字距 1px；`cover-title` 使用现有 h1/h2 的宋体栈（"Songti SC","STSong",Georgia,serif），22px，最多 3 行，`-webkit-line-clamp: 3`；`cover-meta` 12px 等宽栈。
- 圆角 `var(--radius)`，1px `var(--line)` 描边，居中项加 `box-shadow: 0 24px 48px #0004`。

### 3.2 配色：按分类着色，tone 作为次级

`courses.json` 里 `tone` 只有 `gold` / `green` 两种且交替出现，无法区分 14 门课；分类有 5 个，用分类定色相，tone 决定深浅变体。色值作为 CSS 变量定义在 `:root` 与 `body.dark` 下：

| 分类 | 浅色底 | 深色底 | 文字 |
|---|---|---|---|
| 策略与风险 | `#e8dcc4` | `#3a3222` | ink / `#f1e7d2` |
| 投资与决策 | `#d5e1d8` | `#213a2f` | ink / `#e2eee4` |
| 产业与基础设施 | `#d9dfe6` | `#26313d` | ink / `#e3e9f0` |
| 健康与科学 | `#e3dfd0` | `#33372c` | ink / `#eceadd` |
| 学习与成长 | `#e6dad9` | `#3a2e2f` | ink / `#f0e4e3` |

`tone=gold` 的封面在色底上叠加一道 `var(--gold)` 的细顶边（3px）；`tone=green` 叠加 `var(--accent)`。新增分类时 build 不会失败：未命中的分类落到 `--soft` 底色，并在 `check.mjs` 里打印 warning（不阻断）。

### 3.3 封面流几何

- `.shelf-track`：`display:flex; gap:0; overflow-x:auto; scroll-snap-type:x mandatory; overscroll-behavior-x:contain; perspective:1200px; padding-inline: calc(50% - var(--cover-w)/2)`（让首尾也能居中）。隐藏滚动条（`scrollbar-width:none`），但保持可滚动。
- `.shelf-item`：`flex:0 0 var(--cover-w); scroll-snap-align:center; margin-inline: calc(var(--cover-w) * -0.18)`（相邻封面部分重叠，形成堆叠感）。
- 倾斜由 JS 写在每个 item 的 CSS 变量 `--d`（离视口中心的归一化距离，范围 -1…1，超出截断）上，CSS 负责映射：

```
transform:
  translateX(calc(var(--d) * -1 * 36px))
  translateZ(calc((1 - abs(var(--d))) * 120px - 120px))
  rotateY(calc(clamp(-1, var(--d), 1) * -42deg));
opacity: calc(1 - abs(var(--d)) * 0.35);
z-index: calc(100 - round(abs(var(--d)) * 50));
```

  `abs()` / `round()` 目前 Safari 17.2+、Chrome 120+、Firefox 118+ 支持；为兜底，JS 同时直接写 `--rot`、`--z`、`--tx`、`--op` 四个已算好的值，CSS 用这四个变量，不依赖 CSS 数学函数。以 JS 直写为准，`abs()` 写法只是说明意图。

- `prefers-reduced-motion: reduce`：`transform:none; opacity:1`，`scroll-behavior:auto`，封面流退化为平铺横滑，仍有 snap 与 prev/next。
- 深色模式：色底切换到深色列；封面阴影改为 `0 24px 48px #0008`。

### 3.4 断点

| 宽度 | 封面宽 | 可见封面数 | 其他 |
|---|---|---|---|
| ≥1001px | 300px | 约 5 | 显示圆点与 prev/next |
| 741–1000px | 260px | 约 3–4 | 显示圆点与 prev/next |
| ≤740px | 220px | 约 2–3 | 圆点隐藏，改显示 "3 / 14"；prev/next 保留；`.shelf-detail` 内边距同现有 `.course-content` 移动端值 |

---

## 4. 交互规格

### 4.1 居中检测与状态

- 监听 `.shelf-track` 的 `scroll` 事件，用 `requestAnimationFrame` 节流；每帧对每个**可见**（非 `hidden`）item 计算 `d = (itemCenter - trackCenter) / trackWidth * 2`，写入四个 CSS 变量。
- 离中心最近的 item 为 `active`：加 `aria-current="true"`，其他移除；`.shelf-detail` 更新为它的模板内容（仅当 active 变化时才更新，避免每帧重绘）。
- 初次加载：默认 `active` 为第一门（最新）；`scrollIntoView({inline:'center', block:'nearest', behavior:'instant'})` 把它居中。**不**记录用户上次停留的位置，不新增任何 `localStorage` 键。

### 4.2 输入方式

| 方式 | 行为 |
|---|---|
| 触摸 / 触控板 / 鼠标滚轮横向 | 浏览器原生滚动 + snap，无需 JS |
| 鼠标拖动 | pointerdown 记录起点，pointermove 修改 `scrollLeft`，pointerup 后交给 snap；拖动距离 >6px 时抑制封面链接的 click（`preventDefault` 一次） |
| 点击非居中封面 | 第一次点击把它滚到中间（`preventDefault`），已居中的封面点击才跳转课程 |
| 键盘 | `.shelf-track` 可聚焦；`←`/`→` 切换上一/下一门，`Home`/`End` 到首尾，`Enter` 进入当前课程。封面链接本身也在 Tab 序列中；聚焦某个封面时自动把它滚到中间 |
| prev/next 按钮 | 切换到上一/下一个可见 item；到边界时按钮 `disabled` |
| 圆点 | 点击跳到对应 item；`aria-selected` 跟随 active |

### 4.3 与筛选、搜索联动

- 现有 `filter()` 函数只处理 `.course` 网格卡片；改为同时处理 `.shelf-item`（两者都有 `data-category` 与 `data-search`）。匹配规则一致，`hidden` 一致。
- 筛选后：若当前 active 被隐藏，active 改为第一个可见 item 并居中；prev/next、圆点只在可见 item 之间导航；`#resultStatus` 的文案不变。
- 全部隐藏时：整个 `.shelf` 加 `hidden`，只显示现有 `#emptyState`。
- 计数：`hero-meta` 里的 `{{COURSE_COUNT}}` 等不变。

### 4.4 无障碍

- `.shelf-track` 为 `role=list`，每个 `li` 为 `role=listitem`（默认），封面 `a` 有完整 `aria-label`（标题 + 副标题）；`img.cover-thumb` 为装饰，`alt=""`。
- `.shelf-detail` 为 `aria-live=polite`，切换时朗读标题；但键盘连续切换时用 200ms 去抖，避免朗读洪水。
- 焦点样式沿用站点现有 `outline:3px solid var(--gold)`。
- 不因倾斜降低对比度：`opacity` 最低 0.65，且文字对比度只按居中态验收。
- `prefers-reduced-motion` 规则见 §3.3。

---

## 5. 构建改动（`scripts/build.mjs`）

1. 新增 `{{COURSE_COVERS}}` 占位符，生成顺序为 `[...courses].reverse()`。
2. 每个封面项模板：

```html
<li class="shelf-item" data-slug="…" data-category="…" data-search="…">
  <a class="cover" href="courses/<slug>/index.html" aria-label="<title>：<subtitle>">
    <span class="cover-mat" data-tone="<tone>">
      <span class="cover-category"><category></span>
      <strong class="cover-title"><title></strong>
      <span class="cover-meta"><chapters> 站 · <terms> 术语</span>
    </span>
    <img class="cover-thumb" src="assets/previews/<slug>.webp" alt="" width="1120" height="960" loading="lazy">
  </a>
  <template class="cover-detail">…与网格 .course-content 相同的内部 HTML…</template>
</li>
```

3. 把现有网格卡片的 `.course-content` 内部 HTML 抽成一个函数 `courseContent(c)`，网格与 `<template>` 共用，保证两处文案一致；网格输出字节应与现在完全相同（用 `git diff public/index.html` 核对只多出封面流区块）。
4. `{{SHELF_DETAIL_INITIAL}}`：第一门（最新）课程的 `courseContent`，作为无 JS 时的面板内容。
5. `_headers` 中 CSP 不变（仍是 `script-src 'self' + 哈希`）；主页内联脚本改动后哈希由现有流程重新计算。不新增 `style-src` 或 `img-src` 来源。

所有转义继续用现有 `escape()`。

---

## 6. 测试改动（`scripts/check.mjs`）

新增或扩展以下断言，全部在现有 `npm test` 内运行：

| 测试 | 断言 |
|---|---|
| 封面流覆盖全部课程 | `public/index.html` 中 `.shelf-item` 数量 = `courses.json` 长度；`data-slug` 集合与 slug 集合相等；顺序为逆序 |
| 封面与网格文案一致 | 每门课的 `<template class="cover-detail">` 内容 === 对应 `.course-content` 内部 HTML |
| 链接可解析 | 现有「home links resolve inside public」测试自动覆盖新 `href`/`src`；确认它遍历到 `<template>` 内的链接（正则不区分，天然覆盖） |
| CSP | 现有「CSP permits only original hashed inline scripts」自动覆盖新脚本哈希 |
| 无外链、无 fetch | 现有测试自动覆盖 |
| 无新存储键 | 主页脚本中 `localStorage` 只出现于现有主题键 `jiadi-learning-portal:theme:v1`（新增断言） |
| 无 JS 可用 | `.shelf-detail` 在源码中已有初始内容；`.shelf-nav` 与 `.shelf-dots` 带 `hidden` |
| 分类配色 | 每个 `data-category` 值在主页 CSS 中都有对应 `--cover-*` 变量；缺失时 warning 不阻断 |

---

## 7. 浏览器验收（AGENTS.md 第 4–5 条）

在本地 `public/` 起 HTTP（不是 `file://`），逐项核对并记录到 `validation/homepage-coverflow.md`：

1. Chromium 桌面 1440 / 1024 / 768 宽：初始最新课程居中；拖动、滚轮、←→、Home/End、prev/next、圆点全部可用；面板随之切换；点击非居中封面先居中、再点进入课程。
2. Chromium 移动端模拟 390 宽 + 触摸：横滑 snap，"n / 14" 计数正确，面板可读。
3. 可用时 Safari（macOS / iOS）：`scroll-snap`、`perspective` 与拖动兼容。
4. 深色模式与浅色模式各截一张图。
5. `prefers-reduced-motion: reduce` 下无倾斜、无平滑滚动。
6. 筛选「健康与科学」后：封面流只剩对应课程，active 重新居中；搜索到 0 结果时封面流隐藏、空状态显示；清空后恢复。
7. 控制台无 CSP 报错（本地环境，不含 Cloudflare 注入项）。
8. 键盘从页顶 Tab 进入：跳转链接 → 导航 → 封面流 → 面板动作 → 筛选 → 网格，顺序合理。
9. 网格区域与改动前逐像素一致（对比改前截图）。

`验证覆盖说明`：以上是本地 HTTP + 真机/模拟浏览器的验证；上线后仍需 `npm run verify:live`。

---

## 8. 文档与发布

- `README.md`「包含 … 首页」一句补上「封面流 + 目录网格」。
- `docs/HANDOFF.md` 增加一条：主页新增封面流，零依赖，CSP 未变。
- 提交信息：`Add homepage cover shelf (zero-dependency cover flow above course grid)`。
- 推送 `main` 触发 Workers Builds；成功后从普通网络运行 `npm run verify:live`，并把结果写入 `validation/homepage-coverflow.md`。

---

## 9. 后续可选（本轮不做）

- 正式封面图：为 14 门课生成 3:4 封面（`content/covers/<slug>.webp`），build 时若存在则替换 CSS 卡面中的缩略图区域；不存在则回退到 CSS 卡面。此项需要新的图片工作流与再一次验收。
- 纯 CSS Scroll-Driven Animations：在 `@supports (animation-timeline: view())` 下用 `view()` 时间线替代 JS 计算倾斜，JS 只负责 active 与面板。等主流浏览器覆盖稳定后再评估。
- 课程超过 20 门时：圆点改为分组，或封面流只显示最新 12 门并加「查看全部」锚点跳到网格。

---

## 10. 风险与对策

| 风险 | 对策 |
|---|---|
| 截图缩略在倾斜后显得杂乱 | 缩略只占卡面下 40%，且叠 8% 的色底渐变压暗；标题区承担辨识 |
| 拖动与点击冲突误跳转 | 6px 拖动阈值 + 「非居中先居中」规则 |
| `scroll` 事件在 iOS 上惯性阶段不连续触发 | 用 `scrollend`（支持时）+ rAF 兜底在停止后再算一次 active |
| 筛选后 snap 位置错位 | 每次 `filter()` 结束后重新居中 active 并触发一次重算 |
| 面板 `aria-live` 过于吵闹 | 200ms 去抖，只在 active 真正变化时更新 |
| 主页体积增加 | 预计 CSS +4KB、JS +3KB、HTML 每课约 +1.5KB（模板重复文案）；总增量 <30KB，可接受 |

---

## 11. 待实施时的执行顺序

1. 在 worktree 中先 `npm test` 与 `node scripts/build.mjs`，保存 `public/index.html` 作为改前基线。
2. 改 `templates/home.html`（HTML 骨架 → CSS → JS）。
3. 改 `scripts/build.mjs`（`courseContent()` 抽取 → 封面模板 → 新占位符）。
4. 改 `scripts/check.mjs`（§6）。
5. `npm test`，对比网格区域字节不变。
6. §7 浏览器验收并写记录。
7. §8 文档、提交、推送、线上验证。

---

## 12. 实施附注（2026-09-21，移植到 PWA 主页架构）

本 spec 批准时主页为单文件内联架构；实施期间 main 合入了 PWA/品牌/浅色默认改造（PR #1–#4），主页改为外置 `assets/portal/home.css` 与 `home.js`。实施按本 spec 的意图移植到新架构，偏差如下：

- 封面/圆点/详情由 `scripts/catalog.mjs` 渲染（新增 `COURSE_COVERS`、`SHELF_DOTS`、`SHELF_DETAIL_INITIAL`、`SHELF_CLASS` 占位符，随 `renderCatalog()` 进入替换表；`scripts/build.mjs` 未改）。
- 站内链接使用绝对路径；封面流 JS 并入外置 `content/portal/home.js`（`script-src 'self'`，CSP 无新哈希）；样式追加到 `content/portal/home.css`。
- 移动端断点 740px → 680px（站点现行断点）；`--gold` → `--focus`。
- 筛选/搜索/收藏经新 `update()` 的 `matchesCard` 一致生效；排序下拉只作用于网格，封面流保持最新在前（§2 不变）。
- 程序化居中不再用浏览器平滑 `scrollIntoView`（Chromium 会因逐帧内联样式写入中断动画），改为自绘 rAF 动画；§4.2 行为不变。
- 验收与修复记录见 `validation/homepage-coverflow.md`。

---

## 13. 第二轮设计增量（2026-09-21）

上线后的评审提出 8 项改进，已在分支 `worktree-coverflow-spec` 实施。以下条目**取代** §3–§6 中的对应描述；其余规格不变。

- **不透明压暗取代 opacity**（改 §3.3、§4.4）。18% 的重叠加上 0.65–0.89 的 `opacity` 会让相邻封面的标题互相透出。现在封面始终完全不透明，"后退"由 `.shelf-item::after` 覆盖层表达：JS 写入 `--dim`（中心 0，边缘 0.35），`body.dark` 下改用纯黑并乘 1.45。`--op` 变量删除。`prefers-reduced-motion` 分支同时强制 `transform:none` 与 `--dim` 失效（`opacity:0!important`）。
- **移动端紧凑面板**（改 §3.4）。≤680px 断点：封面 220px → **180px**（仍 3:4），track 内边距收紧到 `8px / 16px`；详情面板只显示「分类 · 版本 / 标题 / 副标题 / `.course-actions`」，`.description`、`.tags`、`.course-stats`、`.course-tip` 由 CSS 隐藏（**模板不变**，构建产物与测试断言不受影响）。390px 宽下 shelf 区块由约 861px 降到 473–518px。
- **Roving tabindex**（改 §4.2、§4.4）。`ul.shelf-track` 不再是 Tab 目标；只有居中封面的链接 `tabindex="0"`，其余 `-1`，初始值由 `catalog.mjs` 渲染，因此无 JS 时首张封面仍可聚焦、每张封面仍是真链接。键盘 ←/→/Home/End 在切换时把焦点一并移到新的居中封面；鼠标拖动与触摸滚动**不**移动焦点（指针按下时只把焦点交给按下的那张封面）。Shelf 内 Tab 位由 16 个降到 3 个（封面 1 + 两个侧边按钮 + 圆点组 1）。
- **圆点语义**（改 §2、§4.2）。`role="tablist"` / `role="tab"` / `aria-selected` 是"标签页"语义，与封面流不符；改为 `<div class="shelf-dots" role="group" aria-label="封面位置">` 内的普通按钮，用 `aria-pressed` 表示当前项。整组只占一个 Tab 位（非当前圆点 `tabindex="-1"`），←/→ 在组内移动并居中对应封面。
- **独立状态行**（改 §2、§4.4）。`.shelf-detail` 去掉 `aria-live="polite"`——整块面板作为 live region 会让屏幕阅读器复述全部正文。改为视觉隐藏的 `<p class="sr-only" id="shelfStatus" role="status" aria-live="polite">`，与面板更新同批、同样 200ms 去抖，只播报 `当前：<标题>（第 n / N 门）`。面板本身保留既有的焦点恢复逻辑。
- **缓存式测量**（改 §4.1）。原实现每帧对每个（已被 transform 过的）item 调 `getBoundingClientRect`，读写交错且自我参照。现在各可见项的**未变换**中心 `offsetLeft + offsetWidth/2` 与 `clientWidth` 在 init、resize 以及每次筛选／`shelfSync` 后由 `shelfRemeasure()` 缓存；每帧只读 `shelfTrack.scrollLeft`，按 `distance = (centre - (scrollLeft + clientWidth/2)) / clientWidth * 2` 计算再写 CSS 变量。`shelfCenter` 继续使用 `offsetLeft`，两者由此在同一坐标系内。实测倾斜角与改前完全相同（0 / -14.12° / -28.25° / -42.00°），初始居中偏移仍为 0px。
- **首图优先级**（补 §5）。首张（最新、初始居中）封面缩略图 `loading="eager" fetchpriority="high"`，第 2、3 张 `loading="eager"`，其余保持 `loading="lazy"`。
- **侧边按钮 DOM 顺序**（补 §2）。两个绝对定位的切换按钮改为「prev 在 `<ul>` 之前、next 在之后」，使 Tab 顺序与视觉顺序一致；视觉位置不变。

验收结果与未覆盖项见 `validation/homepage-coverflow.md` 的「第二轮改进（2026-09-21）」。
