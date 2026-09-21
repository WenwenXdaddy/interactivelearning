# 接续任务

已选仓库 WenwenXdaddy/interactivelearning；固定域名 learning.jiadi.ai。
保持公开仓库设置，Worker 名称 interactivelearning；不要创建其他仓库或 Worker。
**连接与上线已完成**（2026-09-16 核实：提交 53f51f3 的 Workers Builds 检查成功，
本机 npm run verify:live 通过）。推送 main 即由 Cloudflare 部署。
原课程不要重写。先读 AGENTS.md、README.md、DEPLOYMENT.md，运行 npm test。
每次推送后用 `gh api repos/WenwenXdaddy/interactivelearning/commits/<sha>/check-runs` 核对部署结论。
线上验证要在普通网络上跑；GitHub 机器会被 Cloudflare 以 403 挡住（脚本报 INCONCLUSIVE，退出码 2）。
只有正式域名的内容、HTTPS 和功能验证通过，才报告已上线。
不要求用户在聊天粘贴 token；不修改其他站点或加入数据库、登录、遥测。

2026-09-21：主页新增封面流（cover shelf），位于目录网格上方；零依赖（原生 scroll-snap + portal home.js 内联逻辑），CSP 未变。见 docs/coverflow-spec.md 与 validation/homepage-coverflow.md。
