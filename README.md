# 有限元分析 · 中文自学教材

按 `knowledge-prompt(1).md` 建设。主线覆盖已提供的 15 页课堂 PDF 和 2026.10.19 目录下 9 张板书，包含差分、杆件弱形式、一维/二维单元、三角形与材料界面。参考书单独盘点，不代替课堂范围。

正文唯一维护位置：`笔记整理/*.md`。从 [课程首页](笔记整理/index.md) 或 [学习指南](笔记整理/学习指南.md) 开始；完整交付与限制见 [建设报告](笔记整理/建设报告.md)。

## 本地运行

要求 Node.js 22+、pnpm 11.25.0、Python 3.10+、NumPy。依赖版本锁定在 `pnpm-lock.yaml`。构建同时生成含源码 Git commit 的 `version.json`。

```sh
pnpm install --frozen-lockfile
python -m pip install numpy
python scripts/experiments.py
pnpm check
pnpm build
```

构建输出为 `site/` 静态站点。预览：`python -m http.server -d site 5173`，浏览器打开 `http://127.0.0.1:5173/`。KaTeX 在构建期渲染为 HTML + MathML，正文公式不依赖外网或浏览器运行 JS。全文搜索、深浅色切换需要 JS；正文、静态图、目录与导航链接均为静态页面，禁用 JS 也可阅读。

## 索引与维护

- `sources.json`：原件 SHA-256、页数、重复关系及审阅范围。
- `coverage.json`：S01 的 15 个物理页及 C01–C09 的处理记录。
- `knowledge.json`：99 个稳定知识/推导检索条目。
- `scripts/experiments.py`：数值交叉验证与静态教学图。
- `scripts/check.mjs`：链接、锚点、来源哈希、内容基线及构建公式检查。
- `history/`：旧笔记归档与后续有理由的基线更新记录。

更新流程见 [维护说明](笔记整理/维护说明.md)，长期规范见 [AGENTS.md](AGENTS.md)。

## 发布

源码仓库：[https://github.com/wly63227/UCAS-finite-element-analysis](https://github.com/wly63227/UCAS-finite-element-analysis)（私有）。已配置本地 `origin`。原始书籍、高清课堂照片、依赖和生成目录均被忽略。

站点与同级 `UCAS-machine-learning` 仓库同构：侧栏导航、全文搜索、深浅色切换、章节页眉页脚与右侧目录由 `scripts/build.mjs` 统一生成；外观文件为 `scripts/style.css` 与 `scripts/app.js`。

工作流在每次推送 `main` 时执行数值实验、内容与构建检查，并将 `site/` 部署到 GitHub Pages（Settings → Pages 选择 GitHub Actions 即可）。相对链接使站点在 `wly63227.github.io/UCAS-finite-element-analysis/` 子路径下无需额外 `BASE_PATH` 配置。私有仓库的 Pages 可用性取决于账户方案；启用 Pages 不等于改变仓库可见性。
