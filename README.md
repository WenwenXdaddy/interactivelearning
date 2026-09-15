# JIADI 学习实验室

目标域名：**learning.jiadi.ai** · 仓库：**WenwenXdaddy/interactivelearning**

包含黄金波动率实验室 v2、未知投资实验室，以及可持续增加课程的首页。
原课程 JavaScript 保留；只增加站点导航。无账号、数据库、运行时 API 或遥测。
学习记录仅保存在浏览器，可导出笔记，不自动跨设备同步。

## 当前发布边界

导入工作流成功后，完整源文件与生成的 public/ 会提交到 main。
**GitHub 导入不等于 Cloudflare 上线。** 尚需在 Cloudflare 连接仓库并部署。
仓库目前为公开仓库；本流程不改变可见性、不修改 Cloudflare DNS。

## Cloudflare Workers Git 部署

在 Cloudflare 创建或导入 Workers 项目，连接本仓库：

| 字段 | 值 |
|---|---|
| Worker / 项目名称 | learning-lab |
| 仓库 | WenwenXdaddy/interactivelearning |
| 生产分支 | main |
| 根目录 | 仓库根目录 |
| Build command | npm test |
| Deploy command | npx wrangler deploy |
| Node.js | 22 或更高 |

wrangler.jsonc 已固定 learning.jiadi.ai，静态目录为 public/。
只处理这个子域名，不更改 jiadi.ai 主站或其他项目。存在域名冲突时停止并核对。

## 本地开发

```bash
npm install
npm test
npm run preview
```

通过本机已授权的 Cloudflare CLI 发布时，运行：

```bash
node scripts/publish.mjs --cloudflare
npm run verify:live
```

不要再运行 --all 或创建 learning-lab 仓库：正式仓库已经是 interactivelearning。
不需要把任何 token 发到聊天或提交进仓库。

## 增加课程

保留独立课程源文件于 content/courses/<slug>/，更新 courses.json，运行 npm test。
只有 public/ 对外发布；content/、scripts/、validation/ 不作为静态根目录。
两门原始课程可从站点首页下载为离线 HTML。

详见 DEPLOYMENT.md、AGENTS.md 和 docs/HANDOFF.md。
validation/ 中的既有报告是此前本地测试记录，不能替代这次 CI 或正式域名验收。
