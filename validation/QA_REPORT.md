# 验收记录｜learning.jiadi.ai 站点整合版 1.0.0

日期：2026-09-15。**本轮未创建远程仓库、未部署 Cloudflare、未修改 DNS、未验证正式域名上线。**

## 输入与变更

读取并保留 `gold_volatility_learning_lab_v2.html`（206,204 字节）、`unknown_unknowable_learning_lab.html`（127,189 字节）及各自 Markdown 手册。

新增首页、课程分类/搜索、明暗切换、返回首页、下载版入口、canonical 元数据、favicon、404、manifest、部署安全头及发布脚本。

原课程的全部 JavaScript、原有 DOM ID、章节、学习手册及下载原件保持一致。站点版只额外注入导航、隔离的 CSS 和元数据。没有重估金融模型、更新市场数据、修改来源、迁移保存格式或同步用户记录。

## 实际执行

| 检查层 | 结果 | 范围 |
|---|---|---|
| `npm test` | **24/24 通过** | 原脚本逐字节、来源/下载一致性、默认目录、ID、存储键、配置域名、路径及脚本语法 |
| `python validation/browser_smoke.py` | **45/45 通过** | 系统 Chromium 离线 DOM；6 项黄金默认数值回归、5 个未知课程模型回归、参数联动、词典、测验、Blob 导出、首页筛选/主题与窄屏 |
| `python validation/http_check.py` | **15/15 通过** | 真正的本地 Node HTTP 服务：首页、课程散列、下载响应头、CSP、404、HEAD、拒绝 POST/内部配置路径 |
| 发布相关 JavaScript 语法检查 | **通过** | `node --check`，不等于真实登录与发布 |
| 桌面/手机截图 | **已生成并查看** | 首页浅/深色、390px 手机、两课新导航；另检查 360px 无整页横向溢出 |

固定测试记录见 `validation/evidence/initial-browser-results.json` 和 `initial-http-results.json`。

## 本轮发现并修复

新增返回首页入口后，未知课程在 360px 下出现 19px 的整页溢出。原因是原页面窄屏标题旁的英文副标题仍强制单行。只在站点导航注入层对窄屏隐藏该英文小字，保留中文标题和所有模型脚本，回归后 360px / 390px 均无整页溢出。首页也缩小了窄屏品牌副标题字距，避免导航换行。

黄金课程的搜索框可先消费 Esc 以清空搜索；测试改为从对话框关闭按钮焦点发出 Esc，验证原生对话框关闭，不为让测试通过而重写课程行为。

## 环境限制，不能升级为 PASS

- Playwright 默认配套浏览器未安装，改用系统 `/usr/bin/chromium`。
- 浏览器访问本地 HTTP 地址被管理策略以 `ERR_BLOCKED_BY_ADMINISTRATOR` 阻止；没有修改策略或关闭这些限制。
- 浏览器交互检查改用 `set_content` 注入本地 HTML，在内存中嵌入截图，并用内存存储替身隔离课程状态。CSP 的脚本哈希通过 meta 方式验证；`frame-ancestors` 为 HTTP-only，另外检查响应头。**这不是生产 HTTP 导航、原生 localStorage、真实刷新恢复或真机 Safari 证明。**
- 本地 HTTP 服务通过 Python HTTP 客户端实测，但它不是 Wrangler / Cloudflare 仿真器，不能证明 CDN、TLS、边缘路由或 `_headers` 在正式环境的最终行为。
- npm registry 在当前容器中解析失败，Wrangler 未安装，未执行 Wrangler dry-run 或远程 deploy，也没有虚构依赖锁文件。首次安装后需保留和审阅 lockfile。
- 对正式域名的容器请求也解析失败；由于容器同时存在外部 DNS 限制，不能据此断言公共 DNS 不存在。
- GitHub 当前可访问列表不含目标仓库，读取返回 404；该连接无新建仓库动作。没有替用户在别的仓库创建替代项目。
- 未找到可用 Cloudflare 连接。发布助手没有在真实授权账户上端到端测试，Git Builds 也尚未连接。

## 发布后必须补测

运行 `npm run verify:live`，检查实际域名、课程字节、下载、安全头和 404。然后在真实 iPhone Safari / 桌面浏览器测试进入/返回、术语查阅、控件联动、重新打开后的本地进度及 Markdown 导出。验证 Cloudflare Git 自动发布须做一次真实仓库提交。

项目文件以包内 `CHECKSUMS.sha256` 为验真依据；课程源文件/发布文件散列另见 `public/site-manifest.json`。
