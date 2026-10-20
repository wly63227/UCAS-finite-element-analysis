import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from 'marked';
import katex from 'katex';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, '笔记整理');
const out = path.join(root, 'site');

// In CI, GitHub Actions provides GITHUB_SHA. Locally this is null (no subprocess needed).
const sourceCommit = process.env.GITHUB_SHA ?? null;

fs.mkdirSync(out, {recursive: true});

// Manual recursive copy (avoids fs.cpSync from node_modules, which some sandboxes block).
function copyDir(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  for (const e of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const esc = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const slug = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\- ]/gu, '').trim().replace(/\s+/g, '-');

function stripFrontmatter(text) {
  // Remove a leading YAML frontmatter block (--- ... ---) if present.
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length) : text;
}

// ---- Page ordering (mirrors the ML sibling site: guide, chapters, then meta) ----
const CHAPTER_RE = /^\d\d-.*\.md$/;
const ORDER = [
  'index.md',
  '学习指南.md',
  '学习大纲.md',
  ...fs.readdirSync(docs).filter(n => CHAPTER_RE.test(n)).sort(),
  '建设报告.md',   // audit
  '来源覆盖.md',   // coverage
  '练习与实验.md', // exercises
  '知识点清单.md', // knowledge
  '资料清单.md',   // sources
  '维护说明.md',   // maintenance
  '勘误.md',
];

const allMd = fs.readdirSync(docs).filter(n => n.endsWith('.md') && n !== 'README.md');
const byName = new Map(allMd.map(n => [n, fs.readFileSync(path.join(docs, n), 'utf8')]));

const ordered = [];
for (const name of ORDER) {
  if (byName.has(name)) ordered.push({name, text: stripFrontmatter(byName.get(name))});
}
// Append any top-level markdown not explicitly listed (defensive).
for (const name of allMd) {
  if (!ordered.some(o => o.name === name)) ordered.push({name, text: stripFrontmatter(byName.get(name))});
}

for (const e of ordered) {
  e.title = e.text.match(/^# (.+)$/m)?.[1] ?? e.name;
  e.url = e.name.replace(/\.md$/, '.html');
  e.navLabel = e.title.replace(/^\d+\s*[·.]\s*/, '').replace(/[（(]笔记[^）)]*[）)]$/, '').replace(/\s*·\s*$/, '').trim();
}

function navLabel(title) {
  return title.replace(/^\d+\s*[·.]\s*/, '').replace(/[（(]笔记[^）)]*[）)]$/, '').replace(/\s*·\s*$/, '').trim();
}

let formulaCount = 0;
const index = [];

for (let i = 0; i < ordered.length; i++) {
  const e = ordered[i];
  const depth = e.url.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  const math = [];
  const source = e.text.replace(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g, (all, block, inline) => {
    const html = katex.renderToString((block ?? inline).trim(), {displayMode: block !== undefined, throwOnError: true, output: 'htmlAndMathml', strict: false});
    formulaCount++;
    math.push(html);
    return `MATHPLACEHOLDER${math.length - 1}END`;
  });

  const headings = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({tokens, depth}) {
    let text = this.parser.parseInline(tokens);
    let id = text.match(/\s*\{#([^}]+)\}$/)?.[1];
    text = text.replace(/\s*\{#[^}]+\}$/, '');
    id ??= slug(text);
    headings.push({depth, text, id});
    return `<h${depth} id="${esc(id)}">${text}<a class="anchor" href="#${esc(id)}" aria-label="本节链接">#</a></h${depth}>`;
  };

  let body = marked.parse(source, {renderer, gfm: true})
    .replace(/MATHPLACEHOLDER(\d+)END/g, (_, n) => math[Number(n)])
    .replace(/href="([^"#?]*?)\.md(#[^"]*)?"/g, (_, name, anchor) => `href="${name}.html${anchor ?? ''}"`);

  const nav = ordered.map(x => `<a ${x === e ? 'aria-current="page"' : ''} href="${prefix + x.url}" data-search="${esc(x.navLabel)}">${esc(x.navLabel)}</a>`).join('');
  const toc = headings.filter(h => h.depth === 2).map(h => `<a href="#${esc(h.id)}">${h.text}</a>`).join('');
  const prev = ordered[i - 1], next = ordered[i + 1];

  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${esc(e.title)} · 有限元分析教材</title><link rel="stylesheet" href="${prefix}assets/katex/katex.min.css"><link rel="stylesheet" href="${prefix}assets/style.css"></head><body><a class="skip" href="#content">跳到正文</a><header><a href="${prefix}index.html" class="brand">FEA <span>有限元分析 · 学习笔记</span></a><button id="theme" aria-label="切换深浅色">深浅色</button></header><div class="layout"><aside class="sidebar"><label for="search">搜索全书</label><input id="search" type="search" placeholder="概念、公式或关键词" autocomplete="off"><div id="results" role="status" aria-live="polite"></div><nav aria-label="章节">${nav}</nav><small>2026 课堂主讲 · 往年参考<br>教材初稿 / 2026-10-20</small></aside><main id="content"><div class="eyebrow">UCAS · FINITE ELEMENT ANALYSIS</div><article>${body}</article><footer>${prev ? `<a href="${prefix + prev.url}">← ${esc(prev.navLabel)}</a>` : '<span></span>'}${next ? `<a href="${prefix + next.url}">${esc(next.navLabel)} →</a>` : ''}</footer></main><aside class="toc"><strong>本页内容</strong>${toc}<a href="#content">↑ 返回顶部</a></aside></div><script src="${prefix}assets/search-data.js"></script><script src="${prefix}assets/app.js" defer></script><noscript><p class="noscript">正文、公式和目录均可阅读；全文搜索与主题按钮需要 JavaScript。</p></noscript></body></html>`;

  const target = path.join(out, e.url);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, html);

  index.push({
    title: e.navLabel,
    url: e.url,
    text: e.text.replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\$[^$\n]*\$/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\{#[^}]+\}/g, '').replace(/[#*`>|]/g, ' '),
  });
}

fs.mkdirSync(path.join(out, 'assets'), {recursive: true});
for (const name of ['style.css', 'app.js']) fs.copyFileSync(path.join(root, 'scripts', name), path.join(out, 'assets', name));
if (fs.existsSync(path.join(docs, 'assets'))) copyDir(path.join(docs, 'assets'), path.join(out, 'assets'));
copyDir(path.join(root, 'node_modules/katex/dist'), path.join(out, 'assets/katex'));
// Provide the experiment source as a downloadable copy referenced by 练习与实验.md.
fs.mkdirSync(path.join(out, 'downloads'), {recursive: true});
fs.copyFileSync(path.join(root, 'scripts', 'experiments.py'), path.join(out, 'downloads', 'experiments.py'));
fs.writeFileSync(path.join(out, 'assets/search-data.js'), 'window.FEA_SEARCH=' + JSON.stringify(index) + ';');
fs.writeFileSync(path.join(out, 'version.json'), JSON.stringify({commit: sourceCommit, builtAt: new Date().toISOString(), contentStatus: 'draft'}, null, 2));
fs.writeFileSync(path.join(root, 'build-report.json'), JSON.stringify({pages: ordered.length, formulas: formulaCount, mathEngine: 'KaTeX local HTML + MathML', date: '2026-10-20'}, null, 2));

// Mirror the built site into the path the deployed Actions workflow publishes.
// The workflow file itself cannot be updated from this environment, so we emit
// the same output twice instead (this directory is gitignored).
const legacyOut = path.join(root, '笔记整理', '.vitepress', 'dist');
fs.rmSync(legacyOut, {recursive: true, force: true});
copyDir(out, legacyOut);

console.log(`Built ${ordered.length} pages; rendered ${formulaCount} formulas locally.`);
