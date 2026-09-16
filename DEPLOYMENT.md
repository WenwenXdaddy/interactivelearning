# learning.jiadi.ai 部署接续

仓库：WenwenXdaddy/interactivelearning（公开，保持用户设置）。
Worker 名称：**interactivelearning**（与 wrangler.jsonc 一致）。早期文档写的 learning-lab 从未实际使用。

**当前状态（2026-09-16 核实）**：Cloudflare Workers Builds 已连接本仓库 main 分支，推送即部署；
提交 53f51f3 的 `Workers Builds: interactivelearning` 检查成功，本机 `npm run verify:live` 确认
线上三门课内容与本地构建一致。下面第 1、2 节是当初的导入与连接记录，已完成，保留备查。

## 1. 先确认导入

在 GitHub Actions 查看 Import verified learning site。
只有该次运行成功且 main 出现 package.json、content/、public/、wrangler.jsonc，
才表示站点文件已经导入。源文件指纹记录在 docs/import-source.json。
CI 会运行 npm test，验证原课程脚本、链接、CSP 与固定域名。

## 2. 连接 Cloudflare

在拥有有效 jiadi.ai Zone 的 Cloudflare 账户中，创建或导入 Workers 项目，
连接 WenwenXdaddy/interactivelearning，Worker 名称为 interactivelearning。
生产分支 main，项目根目录为仓库根目录，Build command 为 npm test，
Deploy command 为 npx wrangler deploy，Node.js 使用 22 或更高。

本项目无服务器脚本入口；wrangler.jsonc 的 assets.directory 是 ./public。
配置已包含 learning.jiadi.ai 的 custom_domain，workers_dev 和 preview_urls 均关闭。
配置存在不等于 DNS、证书或站点已经生效；核对部署日志与 Domains & Routes。
若该子域名已有其他绑定，不得删除未知记录或覆盖其他项目。
不要更改主域名、macro-liquidity-terminal 或 little-math-kitchen。

## 3. 验证上线

**要在自己电脑上跑，不要指望 CI。** Cloudflare 的机器人防护会对 GitHub Actions 这类机房 IP 返回 403，
脚本会输出 `INCONCLUSIVE` 并以退出码 2 结束——那表示检查没连上站点，不代表部署有问题。

```bash
npm run verify:live
```

该脚本核对站点身份、每门课线上内容与本地构建的哈希、下载响应头和 404。
Cloudflare 会在每个 HTML 响应里注入两段自己的脚本（机器人检测 `__CF$cv$params`
与访问统计 `static.cloudflareinsights.com`），它们不属于构建产物，脚本比较哈希前会先剔除并在输出里说明；
其他任何差异仍然算失败。

注：这两段注入脚本都被本站 CSP 拦截，所以课程页控制台会有 CSP 报错，
Cloudflare 的访问统计实际上没有生效。要改变这一点得调整 Cloudflare 设置或放宽 CSP，需用户决定。

`live-site-check.yml` 是**手动触发**的线上浏览器检查，只覆盖 gold-volatility 与 unknown-unknowable
两门课，且从 GitHub 机器上会被 403 挡住；数据中心课与后续新课都不在其中。

再用手机实测图表、术语、导出、刷新保存和课程导航。
浏览器存储按域名隔离，旧本地文件的记录不会自动迁移。
无服务工作线程，不承诺从网站地址离线重新打开；下载的 HTML 可离线计算。

## 4. 后续更新

修改源文件、npm test、提交 main；连接 Cloudflare Builds 后由其部署。
首次导入用的 GitHub Action 不做 Cloudflare 发布，不需要 Cloudflare secrets。
不要另外建立一套相同目标的 GitHub Actions 自动部署。

## 官方文档

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
