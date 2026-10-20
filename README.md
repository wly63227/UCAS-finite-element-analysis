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
pnpm dev
```

开发地址默认 `http://127.0.0.1:5173/`，构建输出为 `笔记整理/.vitepress/dist/`。MathJax 在构建期生成 SVG，正文公式不依赖外网或浏览器运行 JS。搜索、主题切换和面积坐标交互需要 JS；正文、静态图和导航链接有静态页面。

## 索引与维护

- `sources.json`：原件 SHA-256、页数、重复关系及审阅范围。
- `coverage.json`：S01 的 15 个物理页及 C01–C09 的处理记录。
- `knowledge.json`：99 个稳定知识/推导检索条目。
- `scripts/experiments.py`：数值交叉验证与静态教学图。
- `scripts/check.mjs`：链接、锚点、来源哈希、内容基线及构建公式检查。
- `history/`：旧笔记归档与后续有理由的基线更新记录。

更新流程见 [维护说明](维护说明.md)，长期规范见 [AGENTS.md](AGENTS.md)。

## 发布

已提供 `.github/workflows/pages.yml`。当前目录初始不是 Git 仓库，没有配置远端或可用 GitHub 发布凭据，因此没有宣称上线。创建目标仓库并推送本项目源码，在仓库 Settings → Pages 中选 GitHub Actions。工作流会按仓库名设置 `BASE_PATH`，运行数学/内容检查后部署。原始书籍、高清课堂照片、依赖和生成目录均被忽略；需要本地原件的哈希验证由本地执行，CI 检查清单完整性。
