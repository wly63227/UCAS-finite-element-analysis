# 建设进度

2026-10-20：已依照 knowledge-prompt(1).md 完成当前课堂资料范围的教材与网站建设。原 8 篇笔记核查勘误，新增三角形、材料界面两章；原稿已归档。

已完成：35 个原件清单及去重；15 页课堂 PDF、12 张对应页图与 9 张新增板书的视觉核对；99 个知识检索条目；24 条课堂覆盖；7 张静态图、1 个简洁交互；24 项数值检查；21 个静态页面、877 处数学表达式、959 个站内引用检查。浏览器已验证桌面、390 像素窄屏、深色、中文搜索、交互键盘与重置、脚本禁用下的基础阅读。已建立本地 Git 快照；构建版本清单记录提交与工作区状态。

已知边界：未发现 PPT、独立课程大纲、作业文件、录音原件或初始 Git 仓库。旧笔记称存在的 `笔记.pdf` 不在当前目录；以实际页图和现有 PDF 为准。参考书只盘点和建立文本索引，未全书视觉审阅；不能推定考核范围。GitHub 现已连接，但账户下未找到本课程匹配仓库，本地尚无目标远端，在线部署未完成。已交付源码、静态网站压缩包和 Pages 工作流。重启预览清除旧资源长度缓存后，实验源码下载完整性验证通过。

2026-10-20 后续：按用户要求创建私有 GitHub 仓库 https://github.com/wly63227/UCAS-finite-element-analysis，配置 origin，发布教材源码。CI 默认只做检查和构建；Pages 部署由仓库变量 ENABLE_PAGES 显式启用，网站仍未上线。原始 PDF 和高清照片不上传。

2026-10-20 完善：参照同级仓库 UCAS-machine-learning 的文件夹结构与外观，将构建方式从 VitePress 改为同构的静态生成器 `scripts/build.mjs`（marked + KaTeX 本地渲染，输出 `site/`）。复用 ML 站点的 `style.css`/`app.js` 外观与侧栏、全文搜索、深浅色切换、右侧目录等交互；正文仍只来自 `笔记整理/*.md`，未照搬 ML 内容。首页改为"开始学习"路线表 + "检索与复习"区。部署工作流改为每次推送自动构建并发布 `site/`，不再依赖 ENABLE_PAGES 变量。相应的 `package.json`、`scripts/check.mjs`、`.github/workflows/pages.yml`、`AGENTS.md`、`README.md`、`.gitignore` 已同步更新。

本次完善的实测结果：`node scripts/build.mjs` 产出 **20 个静态页面、878 处 KaTeX 公式**，`node scripts/check.mjs` 通过（99 条知识锚点、24 条课堂覆盖、**976 个站内引用**检查，0 失败）。配套改动：`维护说明.md` 移入 `笔记整理/` 以便作为站点页面构建（原为根目录文件，链接失效）；`练习与实验.md` 去掉 VitePress 的 `withBase` 组件语法，改为普通 Markdown 链接，并由构建复制 `scripts/experiments.py` 到 `site/downloads/` 提供下载；`09` 章移除 `<BarycentricDemo />` 组件标签（纯静态站点无法渲染 Vue），保留静态图 `assets/barycentric.svg` 作为回退并在正文说明。构建改为 npm（`package-lock.json`），已删除失效的 `pnpm-lock.yaml`/`pnpm-workspace.yaml`。

已知边界（沿用并新增）：未在本机执行浏览器视觉验收（桌面/窄屏/深色），该项仍需单独记录；构建成功不等于内容完整。交互组件不再随站点提供。本地 Git 已完成提交；远端推送与 Pages 上线仍需仓库凭据，尚未执行。
