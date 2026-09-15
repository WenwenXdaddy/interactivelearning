# JIADI 学习实验室

固定域名：**learning.jiadi.ai**  
GitHub 仓库：**WenwenXdaddy/interactivelearning**  
Cloudflare Worker 名称：**learning-lab**

## 当前状态

仓库初始化、原始 ZIP 导入脚本及 GitHub Actions 触发流程已提交。
**课程源文件尚待导入；Cloudflare 未部署，域名未核验。**

## 现在只需上传原始 ZIP 一次

1. 从 ChatGPT 对话下载 `learning-lab-site-v1.0.0.zip`，不要解压、重新压缩或改名。
2. 在本仓库根目录选择 **Add file → Upload files**，上传该 ZIP。
3. 将上传提交到 **main**，点击 **Commit changes**。

上传入口：https://github.com/WenwenXdaddy/interactivelearning/upload/main

上传提交会触发 **Import verified learning site**：核对原始 ZIP 和两门课的 SHA-256，恢复课程及首页、更新实际仓库名、运行构建与完整性检查，然后把完整源码和 public/ 提交到 main。
成功后 ZIP 会从当前文件树删除，但仍保留在上传提交历史中。

查看执行结果：https://github.com/WenwenXdaddy/interactivelearning/actions/workflows/import-site.yml

只有该流程成功且仓库出现 `public/`、`content/`、`package.json` 和 `wrangler.jsonc`，才表示站点文件已导入。
不要在 ZIP 上传前手动运行工作流；不要先手工增加这些目录，以免触发防覆盖保护。

## 核验与安全边界

- 仅接受此前交付的原始 ZIP：SHA-256 `78758893bf8bea800fcac970d51bc0ab2df26f414039753baa8df0df2c1c2eeb`。
- 两门课程的原始 JavaScript 不重写。
- 已在本地执行导入及 24 项静态完整性检查；GitHub 上的完整运行仍待 ZIP 上传。
- 仓库保持用户设置的公开可见性，不创建或修改其他仓库。
- GitHub Action 只导入文件，不连接 Cloudflare、不修改 DNS，也不需要 Cloudflare token。
- 导入后仍需在 Cloudflare 将此仓库连接到 `learning-lab` Worker，并验证 `learning.jiadi.ai`。

此 README 会在导入成功后自动替换为完整项目说明和部署步骤。
