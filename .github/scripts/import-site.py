#!/usr/bin/env python3
"""Import exactly the reviewed site archive; never contacts Cloudflare or reads secrets."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import sys
import zipfile

REPO = 'WenwenXdaddy/interactivelearning'
ARCHIVE = 'learning-lab-site-v1.0.0.zip'
EXPECTED = '78758893bf8bea800fcac970d51bc0ab2df26f414039753baa8df0df2c1c2eeb'
SOURCES = {
    'gold-volatility': '6c504df1031559ab28e2ba7fbb3e3ae7e23d6a08fd14fb4806f1dfcdbe4351b5',
    'unknown-unknowable': '12e10e3ca58e57b42a23ae9fd983654eb7c85b4835d6bc090e22fb909d89317c',
}
root = Path.cwd()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def write(name, text):
    p = root / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')

def main():
    if os.environ.get('GITHUB_REPOSITORY', REPO).lower() != REPO.lower():
        raise ValueError('Wrong repository; no files were imported.')
    archive = root / ARCHIVE
    if not archive.is_file():
        raise ValueError('Upload ' + ARCHIVE + ' to the repository root first.')
    if digest(archive.read_bytes()) != EXPECTED:
        raise ValueError('Archive SHA-256 differs from the reviewed download. Nothing imported.')
    for sentinel in ['content', 'public', 'templates', 'package.json']:
        if (root / sentinel).exists():
            raise ValueError('Existing site found at ' + sentinel + '; stop rather than overwrite.')
    with zipfile.ZipFile(archive) as z:
        members = z.infolist()
        if sum(i.file_size for i in members) > 20 * 1024 * 1024:
            raise ValueError('Archive too large.')
        payload = {}
        for item in members:
            p = PurePosixPath(item.filename)
            if (p.is_absolute() or '..' in p.parts or '\\' in item.filename
                or not p.parts or p.parts[0] != 'learning-lab-site'
                or stat.S_ISLNK(item.external_attr >> 16)):
                raise ValueError('Unsafe archive member: ' + item.filename)
            rel = PurePosixPath(*p.parts[1:])
            if item.is_dir():
                continue
            if not rel.parts or any(v in {'.git', '.github', '.env', 'node_modules'} for v in rel.parts):
                raise ValueError('Disallowed archive member: ' + item.filename)
            if str(rel) in payload:
                raise ValueError('Duplicate archive member.')
            payload[str(rel)] = z.read(item)
    for slug, expected in SOURCES.items():
        if digest(payload['content/courses/' + slug + '/index.html']) != expected:
            raise ValueError('Original course fingerprint mismatch: ' + slug)
    for rel, data in payload.items():
        target = root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    # Update repository references only, not course code or the Cloudflare Worker name.
    for name in ['AGENTS.md', 'scripts/publish.mjs']:
        p = root / name
        text = p.read_text(encoding='utf-8').replace('WenwenXdaddy/learning-lab', REPO)
        if name.endswith('publish.mjs'):
            text = text.replace("repo='learning-lab'", "repo='interactivelearning'")
            text = text.replace('connect the private repository', 'connect the existing repository')
            text = ("if(process.argv[2]!=='--cloudflare'){console.error('The GitHub repository already exists. Use node scripts/publish.mjs --cloudflare; do not run --all or create another repository.');process.exit(2);}\n" + text)
        p.write_text(text, encoding='utf-8')

    write('README.md', '''# JIADI 学习实验室

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
''')
    write('DEPLOYMENT.md', '''# learning.jiadi.ai 部署接续

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
''')
    write('docs/HANDOFF.md', '''# 接续任务

已选仓库 WenwenXdaddy/interactivelearning；固定域名 learning.jiadi.ai。
保持公开仓库设置，Worker 名称 learning-lab；不要创建其他仓库。
原课程不要重写。先读 AGENTS.md、README.md、DEPLOYMENT.md，运行 npm test。
检查 GitHub Actions 实际结论，再在用户授权的 Cloudflare 账户中连接并部署。
核对 Zone、同名 Worker 和子域名现有绑定，不覆盖不明项目。
只有正式域名的内容、HTTPS 和功能验证通过，才报告已上线。
不要求用户在聊天粘贴 token；不修改其他站点或加入数据库、登录、遥测。
''')
    write('docs/deployment-state.json', json.dumps({
        'repository': REPO, 'repositoryVisibility': 'public', 'worker': 'learning-lab',
        'domain': 'learning.jiadi.ai', 'sourceFilesRestored': True,
        'cloudflareDeploymentVerified': False, 'dnsModifiedByImporter': False,
        'note': 'Check GitHub Actions for build success; Cloudflare must be connected separately.'
    }, ensure_ascii=False, indent=2) + '\n')
    write('docs/import-source.json', json.dumps({
        'archive': ARCHIVE, 'archiveSha256': EXPECTED, 'originalCourseSha256': SOURCES,
        'note': 'Fingerprints verified before extraction. Course JavaScript is not rewritten.'
    }, ensure_ascii=False, indent=2) + '\n')
    # The old checksum list described the old repository instructions; avoid stale assertions.
    (root / 'CHECKSUMS.sha256').unlink(missing_ok=True)
    archive.unlink()
    print('Restored verified original courses. Next: npm test. Cloudflare was not contacted.')

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        sys.exit('IMPORT STOPPED: ' + str(exc))
