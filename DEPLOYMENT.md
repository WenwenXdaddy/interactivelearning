# learning.jiadi.ai 部署接续

仓库：WenwenXdaddy/interactivelearning（公开，保持用户设置）。
Worker 名称：learning-lab。仓库名称和 Worker 名称不同是有意安排。

## 1. 先确认导入

在 GitHub Actions 查看 Import verified learning site。
只有该次运行成功且 main 出现 package.json、content/、public/、wrangler.jsonc，
才表示站点文件已经导入。源文件指纹记录在 docs/import-source.json。
CI 会运行 npm test，验证原课程脚本、链接、CSP 与固定域名。

## 2. 连接 Cloudflare

在拥有有效 jiadi.ai Zone 的 Cloudflare 账户中，创建或导入 Workers 项目，
连接 WenwenXdaddy/interactivelearning，Worker 名称设为 learning-lab。
生产分支 main，项目根目录为仓库根目录，Build command 为 npm test，
Deploy command 为 npx wrangler deploy，Node.js 使用 22 或更高。

本项目无服务器脚本入口；wrangler.jsonc 的 assets.directory 是 ./public。
配置已包含 learning.jiadi.ai 的 custom_domain，workers_dev 和 preview_urls 均关闭。
配置存在不等于 DNS、证书或站点已经生效；核对部署日志与 Domains & Routes。
若该子域名已有其他绑定，不得删除未知记录或覆盖其他项目。
不要更改主域名、macro-liquidity-terminal 或 little-math-kitchen。

## 3. 验证上线

```bash
npm install
npm run verify:live
```

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
