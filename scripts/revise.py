"""One-time editorial correction of the inherited notes; original files are archived."""
from pathlib import Path
import re, zipfile
root = Path(__file__).resolve().parent.parent
if (root/'knowledge.json').exists():
    raise SystemExit('Initial migration already complete. Edit canonical Markdown; do not replay archived notes.')
notes = root/'笔记整理'
archive = root/'history'/'notes-before-2026-10-20.zip'
archive.parent.mkdir(exist_ok=True)
if not archive.exists():
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in notes.glob('*.md'): z.write(p, p.name)

def edit(prefix, changes):
    p = next(notes.glob(prefix+'-*.md'))
    with zipfile.ZipFile(archive) as z:
        s = z.read(p.name).decode('utf-8')
    for a,b in changes:
        if a not in s: raise ValueError(f'Missing edit in {p.name}: {a[:70]}')
        s = s.replace(a,b)
    s = re.sub(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]',lambda m:f'[{m[2] or m[1]}](./{m[1]}.md)',s)
    # Existing book chapter references are retained as historical reading hints, not verified citations.
    head_end = s.find('\n', s.find('\n# ')+1)
    s = s[:head_end]+ '\n\n> 2026-10-20 核查版：核心内容对照现有课堂 PDF；本篇中的参考书章节号沿用旧稿，尚未逐项核实，只作查找线索。推导和例子中的解释补充不等于教师原话。\n'+s[head_end:]
    p.write_text(s,encoding='utf-8')

edit('01',[
('数学分析讨论的是**存在且能写出解析表达式**的解；','数学分析研究极限、连续、微分、积分及其理论，并不以解能写成解析表达式为前提；'),
('热对流扩散方程（傅里叶定律）：','静止介质中的热传导方程（能量守恒结合傅里叶定律）：'),
('两条路最后都归结为**同一个线性代数问题**','在本书的线性稳态模型中，两条路最后都归结为**线性代数方程组**'),
('两种表述描述同一物理过程，写出来的方程形式不同（守恒形式 vs 非守恒形式），这一点在第 1 节课\n强调"如何描述物理过程"时提到过。','两种描述跟踪对象不同。Euler/Lagrange 与守恒/非守恒是两组不同分类，不能一一对应；这里的物质导数由链式法则得到。'),
('双曲型（波动/地震）在后续课程或\n《工程地震学》里出现，差分参考书第 7 章专门讲。','双曲型列作方法背景；当前材料不足以确认后续授课或考核安排。分类表适用于所写的标量二阶主部；热方程把时间作为一个自变量理解。'),
('舍入误差反而随网格加密而**放大**（条件数增大）。','常见未预处理的刚度矩阵条件数随网格加密增大，舍入与数据误差的**放大上界**可能增大；实际误差并非每次必增。'),
('见 P7 讨论的条件数 $\\mathrm{Cond}(A)=\\lvert\\lambda_{\\max}\\rvert/\\lvert\\lambda_{\\min}\\rvert$','见 P7：一般 $\\kappa_2(A)=\\sigma_{\\max}/\\sigma_{\\min}$，仅对称正定阵可写成特征值最大最小之比')
])
edit('04',[
('\\bar u\\in C_0^1([0,L])','\\bar u\\in V'),
('取**任意**检验函数 $\\bar u(x)\\in C_0^1[0,L]$（一阶连续可微，且在 $x=0$ 处为零，即 $\\bar u(0)=0$），','取**任意**检验函数 $v=\\bar u\\in V=\\{v\\in H^1(0,L):v(0)=0\\}$。其中 $H^1$ 表示函数及其一阶弱导数平方可积；也可先对光滑检验函数推导，再延拓到 $V$。'),
('检验函数为什么必须取 $C_0^1$','检验函数为什么必须在固定位移端取零'),
('\\forall\\bar u\\in C_0^1[0,L]','\\forall\\bar u\\in V'),
('\\forall\\,\\bar u\\in C_0^1','\\forall\\,\\bar u\\in V'),
('要求解 $u\\in C^2[0,L]$（二阶连续可微）','在系数和数据充分光滑时，可寻求经典解（如 $u\\in C^2$）'),
('用试探函数本身作为权函数 $\\bar u=\\delta u$，','从与齐次边界试探空间相同的空间选取检验函数，'),
('它们等价，值得理清：','对本节对称、正定的线性杆件模型，它们给出相同离散方程；一般非对称算子未必有最小能量原理：'),
('如果对所有 $\\bar u$ 积分都为 0，则方括号内必处处为零','若残差连续且对所有内部光滑紧支集检验函数积分为零，则残差处处为零'),
('为什么检验函数取 $C_0^1$ 而不是 $C^1$？','为什么检验函数必须满足 $v(0)=0$？'),
('只有让 $\\bar u(0)=0$','令 $\\bar u(0)=0$'),
('教材第二章 §1.6 讨论的就是这个空间；','该空间的教材章节位置待核；'),
('$ES\\,u\'+ku=g$','$ES\\,u\' n+\\alpha u=g$（$n$ 为一维外法向）')
])
edit('05',[
('\\int_{e_i}ES\\frac{\\mathrm du}{\\mathrm dx}\\frac{\\mathrm d\\bar u}{\\mathrm dx}\\,\\mathrm dx\n=\\int_{e_i}\\left(\\frac{\\mathrm dN}{\\mathrm dx}\\right)^{\\mathrm T}ES\\left(\\frac{\\mathrm dN}{\\mathrm dx}\\right)\\mathrm dx','K^e=\\int_{e_i}\\left(\\frac{\\mathrm dN}{\\mathrm dx}\\right)^{\\mathrm T}ES\\left(\\frac{\\mathrm dN}{\\mathrm dx}\\right)\\mathrm dx'),
('P\\bar u(L)=\\{0,\\,P\\}','P\\bar u(L)=\\{\\bar u\\}_e^\\mathrm T[0,P]^\\mathrm T'),
('\\mathrm{Cond}(A)=\\frac{\\lvert\\lambda_{\\max}\\rvert}{\\lvert\\lambda_{\\min}\\rvert}','\\kappa_2(A)=\\frac{\\lambda_{\\max}}{\\lambda_{\\min}}\\quad(A\\text{ 对称正定})'),
('\\mathrm{Cond}(A)=\\frac{|\\lambda_{\\max}|}{|\\lambda_{\\min}|}','\\kappa_2(A)=\\frac{\\lambda_{\\max}}{\\lambda_{\\min}}\\quad(A\\text{ 对称正定})'),
('笔记 P7 下半页的"二阶插值"就是 p 方法的第一次尝试。','笔记 P7 下半页的“二阶插值”就是提高插值次数。表中误差阶还要求解足够光滑、网格形状规则；指数收敛需要更强的解析性条件。'),
('即使 $\\mathrm{Cond}=10^{10}$ 也还能承受，','若 $\\kappa_2=10^{10}$，最坏情形可损失约 10 位十进制有效数字，是否可接受取决于精度要求；'),
('\\int_{x_1}^{x_3}f(x)\\,\\mathrm dx=\\frac{x_3-x_1}{2}\\Big[f(x_1+g_1)+f(x_1+g_2)\\Big],\\qquad\n\\text{取 }x_{1,2}=x_1+\\frac{x_3-x_1}{2}\\left(1\\mp\\frac{1}{\\sqrt3}\\right)','\\int_{x_1}^{x_3}f(x)\\,\\mathrm dx\\approx\\frac{x_3-x_1}{2}\\left[f(x_{g,-})+f(x_{g,+})\\right],\\qquad\nx_{g,\\pm}=\\frac{x_1+x_3}{2}\\pm\\frac{x_3-x_1}{2\\sqrt3}'),
('**加密网格不一定更好**','**在固定浮点精度下评估网格加密效果**')
])
edit('06',[
('- $\\alpha>0$ 保证正定。','- 正定性来自整体能量和边界约束；本题已有左端 Dirichlet 条件，故不要求 $\\alpha>0$。'),
('两者都对称、都半正定；但**只有 $\\int q[N]^\\mathrm T[N]$ 是严格正定的**，','在 $p>0,q\\ge0$ 时两者都对称半正定；若 $q$ 在单元上为正常数，则 $q$ 项严格正定；$q=0$ 时该项为零。'),
('变分原理/能量极小的提法要求先处理齐次边界条件，非齐次部分作为已知量移到右端。','能量极小也可直接在满足非齐次边界值的仿射空间上表述；通过提升 $u=w+u_g$ 可转成齐次未知量 $w$。'),
('\\frac{\\partial P}{\\partial x}=k\\frac{\\partial^2u}{\\partial x^2}\\bar u+k\\frac{\\partial u}{\\partial x}\\frac{\\partial\\bar u}{\\partial x}','\\frac{\\partial P}{\\partial x}=\\frac{\\partial}{\\partial x}(k\\partial_xu)\\bar u+k\\frac{\\partial u}{\\partial x}\\frac{\\partial\\bar u}{\\partial x}'),
('\\text{节点号}(i,j)=(i-1)(n_y+1)+j','\\text{节点号}(i,j)=(j-1)(n_x+1)+i'),
('（$2\\times2$ 网格，8 个节点、4 个单元）','（$2\\times2$ 网格，9 个节点、4 个单元）'),
('按行编号时半带宽 $\\approx n_y+1$，按列编号时 $\\approx n_x+1$。','只看边相邻节点，按行编号步幅为 $n_x+1$，按列为 $n_y+1$；Q4 单元还耦合对角角点，完整半带宽相应为 $n_x+2$ 或 $n_y+2$。'),
('性质（**考试必考**）：','性质（应掌握，现有材料不足以确认考试安排）：'),
('[B]=[J]^{-1}\\begin{bmatrix}\\partial N/\\partial\\xi\\\\\\partial N/\\partial\\eta\\end{bmatrix}','[B]=[J]^{-\\mathrm T}\\begin{bmatrix}\\partial N/\\partial\\xi\\\\\\partial N/\\partial\\eta\\end{bmatrix}'),
('其中 $[J]$ 是 Jacobi 矩阵。','其中明确约定 $J=\\begin{bmatrix}x_\\xi&x_\\eta\\\\y_\\xi&y_\\eta\\end{bmatrix}$，所以梯度变换必须使用 $J^{-\\mathrm T}$。'),
('**$\\alpha$ 有两个"角色"**：在方程 (3) 里它是第三类边界条件的系数；\n   在离散中它同时出现在**左端（矩阵对角）**和**右端（$g$）**，位置千万别放错。','**Robin 系数与边界载荷分别处理**：$\\alpha$ 贡献边界矩阵（通常含非对角元），$g$ 贡献右端；热对流边界有 $g=\\alpha T_\\infty$。'),
('**边界积分只在有第三类边界条件的边上出现**','**边界矩阵只在第三类边界条件的边上出现**'),
])
