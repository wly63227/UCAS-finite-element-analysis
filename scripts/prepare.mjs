// Initial migration and generated navigation indexes. Run once after editorial changes.
import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),dir=path.join(root,'笔记整理')
const files=fs.readdirSync(dir).filter(n=>/^\d\d-.*\.md$/.test(n)).sort()
const sourceByChapter={ '01':'S01 p.1','02':'S01 p.2','03':'S01 p.3','04':'S01 p.4–5','05':'S01 p.5–8','06':'S01 p.8–12','07':'学习辅助','08':'S01 p.13–15','09':'C01 C02 C03 C06 C07','10':'C08 C09' }
const knowledge=[]
for(const name of files){
  let text=fs.readFileSync(path.join(dir,name),'utf8'),chapter=name.slice(0,2),i=0
  text=text.replaceAll('## 一、笔记原文转写','## 一、课堂内容规范化整理（非逐字）')
  if(chapter==='04')text=text.replace('**主题**：有限元方法的第一个例子。','**主题**：有限元方法的第一个例子。全文采用 $V=\\{v\\in H^1(0,L):v(0)=0\\}$ 为检验空间，$\\bar u$ 也记作 $v$；不使用容易误解为“两端都为零”的 $C_0^1$ 记号。')
  if(chapter==='05')text=text.replaceAll('强形式要求 $u(x)\\in C^2[0,L]$','光滑系数下经典强解可取 $u(x)\\in C^2[0,L]$').replaceAll('强形式要求 $u\\in C^2[0,L]$','光滑系数下经典强解可取 $u\\in C^2[0,L]$')
  if(chapter==='06'){
    text=text.replaceAll('\\bar u(x)\\in C_0^1[0,L]','\\bar u(x)\\in V=\\{v\\in H^1(0,L):v(0)=0\\}')
    text=text.replaceAll('\\bar u(x,y)\\in C_0^1(\\Omega)','\\bar u(x,y)\\in V=\\{v\\in H^1(\\Omega):v|_{\\Gamma_D}=0\\}')
    text=text.replace('只在有第三类边界条件的边上）：','在第三类边界上形成矩阵、在第二/三类边界上形成载荷）：')
    text=text.replace('## 四、数据格式：','## 四、数据格式：')
    // Correct the inherited malformed sample by replacing it with one complete consistent mesh.
    const start=text.indexOf('```text\nnode                    elem')
    if(start>=0){const end=text.indexOf('```',start+7)+3;text=text.slice(0,start)+`\`\`\`text
node (id x y)          elem (id n1 n2 n3 n4)
1 0 0                 1 1 2 5 4
2 1 0                 2 2 3 6 5
3 2 0                 3 4 5 8 7
4 0 1                 4 5 6 9 8
5 1 1
6 2 1
7 0 2
8 1 2
9 2 2
\`\`\``+text.slice(end)}
  }
  // Mermaid is replaced by a maintained static learning map; no client runtime needed.
  text=text.replace(/```mermaid[\s\S]*?```/g,'![建模、离散、装配与求解的学习路径](./assets/learning-map.svg)')
  if(chapter==='05'&&!text.includes('assets/hat.svg'))text=text.replace('### 2.2 单元刚度矩阵','![全局帽函数在相邻两个单元上非零](./assets/hat.svg)\n\n图中一个节点的系数只影响与它相邻的单元，这使总矩阵稀疏。\n\n### 2.2 单元刚度矩阵')
  text=text.replace(/^(#{2,3}) (.+)$/gm,(line,hash,title)=>{
    i++; const existing=title.match(/\{#([^}]+)\}$/)
    const id=existing?.[1]||`kp-${chapter}-${String(i).padStart(2,'0')}`
    const clean=title.replace(/\s*\{#[^}]+\}$/,'')
    knowledge.push({id,title:clean,chapter,file:name,source:sourceByChapter[chapter],kind:['02','03','07','08','09','10'].includes(chapter)?'章首标注课堂依据；推导与例题补充见正文':'课堂提纲与编写者解释，正文分节区分',importance:hash.length===2?'主线':'支撑',depth:hash.length===2?'解释与推导':'分步推导/条目',url:`./${name}#${id}`})
    return `${hash} ${clean} {#${id}}`
  })
  fs.writeFileSync(path.join(dir,name),text)
}
fs.writeFileSync('knowledge.json',JSON.stringify(knowledge,null,2)+'\n')
fs.writeFileSync(path.join(dir,'知识点清单.md'),`# 当前资料知识点清单\n\n本版有 ${knowledge.length} 个稳定检索条目（含概念组、推导与复习条目），覆盖的是已提供资料，不是整学期知识数量。重要度和深度是编写者的学习编排，不是教师考核权重。每条链接指向实际正文锚点；来源字段用于回溯该章，精确页面处理见[来源覆盖](./来源覆盖.md)。\n\n| 编号 | 知识/推导 | 层次 | 讲解深度 | 依据 |\n| --- | --- | --- | --- | --- |\n`+knowledge.map(k=>`| ${k.id} | [${k.title.replaceAll('|','\\|')}](${k.url}) | ${k.importance} | ${k.depth} | ${k.source} |`).join('\n')+'\n')

const sources=JSON.parse(fs.readFileSync('sources.json','utf8'))
let r=0,p=0,c=0
for(const x of sources){
  x.id=x.path==='有限元分析(1).pdf'?'S01':x.path.includes('2026.10.19')?'C'+String(++c).padStart(2,'0'):x.path.endsWith('.jpg')?'P'+String(++p).padStart(2,'0'):'R'+String(++r).padStart(2,'0')
  x.role=x.id==='S01'?'课堂主资料':x.id.startsWith('R')?'参考书；非课堂覆盖对象':x.id.startsWith('P')?'旧笔记页图，与 S01 前 12 页对应':'新增课堂板书；文件夹日期非独立核实授课日期'
  x.review=x.id.startsWith('R')?'哈希/页数/提取状态已盘点；未全书视觉审阅':'2026-10-20 视觉核对'
  x.duplicateOf=sources.find(y=>y!==x&&y.sha256===x.sha256)?.path||null
}
fs.writeFileSync('sources.json',JSON.stringify(sources,null,2)+'\n')
fs.writeFileSync(path.join(dir,'资料清单.md'),'# 课程资料清单与版本\n\n未发现 PPT、正式大纲、独立作业、数据或录音原件。S01 是目前唯一课堂 PDF（15 个物理页），加 9 张新增板书。P01–P12 页图与其前 12 页内容对应，不重复计算课堂覆盖率。参考书共 13 份文件（含完全相同的副本），按哈希辨别重复。文件名不能单独证明作者、版次或教师指定教材。\n\n扫描书籍提取不到文本不表示空白，不能用文本状态判定内容缺失。英文参考书文本已供检索，但这不是全书审阅。当前主线范围由课堂原件决定。\n\n| 编号 | 文件 | 物理页数/类型 | 用途与状态 |\n| --- | --- | --- | --- |\n'+sources.map(x=>`| ${x.id} | ${x.path} | ${x.pages||'照片'} | ${x.role}；${x.review}${x.duplicateOf?'；同哈希副本：'+x.duplicateOf:''} |`).join('\n')+'\n\n完整 SHA-256、字节数和文本提取页数保存在项目根目录 `sources.json`；来源扫描脚本不会修改原件。\n\n## 技术与参考项目\n\n按初始规范参考《测量数据处理理论与方法》的工程思路：[网站](https://aaronchou313.github.io/UCAS-measurement-data-processing/)、[仓库](https://github.com/AaronChou313/UCAS-measurement-data-processing)。本次抓取未成功，不能声称已审阅其具体实现；没有复制课程内容。公式采用 VitePress 原生 MathJax 3 静态渲染，配置依据[官方 Markdown 文档](https://vitepress.dev/guide/markdown#math-equations)。\n')

const pageMap=[
['课程地图与热传导模型','01'],['守恒、三类边界、Taylor 与差分','02'],['二维变系数差分、边界与矩阵','03'],['杆件平衡、连续模型、加权余量','04'],['分部积分、弱形式、线性插值','04','05'],['单元分析、刚度、载荷、装配','05'],['求解后处理、条件数、二次插值','05'],['二次元续、一维一般 ODE 弱形式','05','06'],['一般 ODE 单元矩阵与 Robin','06'],['二维 Poisson、Gauss/Green 推导','06'],['二维弱形式、node/elem、双线性插值','06'],['Q4 梯度与积分照片，无文本层','06'],['二维刚度、数值积分、边界矩阵与域载荷','08'],['边载荷、总体装配','08'],['九节点双二次元、维度','08']]
const photoMap=[['形函数行列式与面积比','09'],['插值系数行列式','09'],['一次/二次多项式、节点示意','09'],['二维弱形式的重复角度','06'],['弱形式与面积坐标概览','06','09'],['三角插值完整板书远景','09'],['面积比、单位分解与节点性质','09'],['界面两侧法向通量抵消','10'],['分区方程、材料界面与分部积分','10']]
const coverage=[]
for(let i=0;i<15;i++)coverage.push({source:'S01',page:i+1,topic:pageMap[i][0],chapters:pageMap[i].slice(1),status:'已视觉核对并整理',note:i===14?'仅保留数学内容；个人“考试”批注不能证实考核安排':''})
for(let i=0;i<9;i++)coverage.push({source:'C'+String(i+1).padStart(2,'0'),page:1,topic:photoMap[i][0],chapters:photoMap[i].slice(1),status:'已视觉核对并整理',note:[0,1,5,6].includes(i)?'同一推导的不同拍摄角度，合并讲解':'人物遮挡或边缘模糊处不猜测逐字内容'})
fs.writeFileSync('coverage.json',JSON.stringify(coverage,null,2)+'\n')
const link=ch=>{const f=files.find(n=>n.startsWith(ch+'-'));return `[${ch}](./${f})`}
fs.writeFileSync(path.join(dir,'来源覆盖.md'),'# 课堂来源逐页覆盖\n\nS01 使用 PDF **物理页码，从 1 开始**；C01–C09 是文件名排序后的固定照片编号，不代表拍摄先后。P01–P12 对应 S01 前 12 页。每个有效课堂页均有正文去处，意味着主题已处理，不等于所有模糊小字已可靠转录。页面上难辨的系数、矩阵下标不作为唯一证据；规范化公式由独立推导验算。\n\n| 来源页 | 核查主题 | 正文 | 处理说明 |\n| --- | --- | --- | --- |\n'+coverage.map(x=>`| ${x.source}${x.source==='S01'?' p.'+x.page:''} | ${x.topic} | ${x.chapters.map(link).join('、')} | ${x.status}；${x.note} |`).join('\n')+'\n\n## 照片编号与文件名\n\n'+sources.filter(x=>x.id.startsWith('C')).map(x=>`- **${x.id}**：\`${x.path}\``).join('\n')+'\n\n## 没有宣称覆盖的资料\n\n所有 R 系列参考书只完成文件盘点、文本索引与去重，未全书逐页编写或视觉审阅。不存在独立授课大纲时，参考书章节不能代替课堂课次。旧笔记的录音时间戳、教师引语和作业说法没有原件可核验，已移出正式课堂要求。新增材料须另加覆盖记录，不能默认与旧版相同。\n')
console.log(JSON.stringify({chapters:files.length,knowledge:knowledge.length,sources:sources.length,classroomPages:coverage.length}))
