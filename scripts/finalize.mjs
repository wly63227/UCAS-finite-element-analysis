import fs from 'node:fs'
const d='笔记整理/'
fs.writeFileSync(d+'README.md','# 有限元分析 · 阅读入口\n\n本目录的 Markdown 是教材唯一正文来源。请从[课程首页](./index.md)、[学习指南](./学习指南.md)或[知识点清单](./知识点清单.md)进入。覆盖范围、来源版本和未核实事项见[来源覆盖](./来源覆盖.md)及[建设报告](./建设报告.md)。\n\n旧稿在根目录 `history/notes-before-2026-10-20.zip` 归档。当前文本已修正热源符号、边界消元、Jacobian 和界面条件等问题；无法核实的录音、作业及考试判断不作为课堂正式要求。\n')
let text=fs.readFileSync(d+'练习与实验.md','utf8').replace('(./public/experiments.py)','(/experiments.py)')
fs.writeFileSync(d+'练习与实验.md',text)
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 350" role="img" aria-labelledby="t"><title id="t">物理模型经过差分或弱形式两条路线进入代数方程组</title><rect width="760" height="350" fill="#f5f7fa"/><g font-family="Segoe UI,Microsoft YaHei,sans-serif" font-size="17" text-anchor="middle" fill="#172f43"><g fill="#e0ecef" stroke="#315c78" stroke-width="2"><rect x="240" y="20" width="280" height="55" rx="8"/><rect x="40" y="120" width="280" height="75" rx="8"/><rect x="440" y="120" width="280" height="75" rx="8"/><rect x="240" y="250" width="280" height="70" rx="8"/><path d="M300 75L180 120M460 75L580 120M180 195L300 250M580 195L460 250" fill="none"/></g><text x="380" y="55">守恒＋本构 → 连续模型</text><text x="180" y="150">节点网格＋差商</text><text x="180" y="178">有限差分</text><text x="580" y="150">弱形式＋分片插值</text><text x="580" y="178">有限元</text><text x="380" y="280">装配＋边界 → Ku = F</text><text x="380" y="307">求解、恢复与误差检查</text></g></svg>`
fs.writeFileSync(d+'assets/learning-map.svg',svg)
// Make the small machine-readable indexes available as optional downloads.
for(const f of ['sources.json','coverage.json','knowledge.json','实验结果.json'])fs.copyFileSync(f,d+'public/'+f)
console.log('Reading entry, downloads and static learning map prepared')
