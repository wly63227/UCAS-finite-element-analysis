---
title: "06 · 一般二阶 ODE 与二维 Poisson 方程的有限元方法（笔记 P8–P12）"
category: "课程"
tags:
  - 课程
  - 有限元分析
created: 2026-10-12
---

# 06 · 一般二阶 ODE 与二维 Poisson 方程的有限元方法（笔记 P8–P12）

> 2026-10-20 核查版：核心内容对照现有课堂 PDF；本篇中的参考书章节号沿用旧稿，尚未逐项核实，只作查找线索。推导和例子中的解释补充不等于教师原话。


> 对应原始笔记：`原图/笔记-08.jpg` ~ `原图/笔记-12.jpg`
> （P8–P9 是一维一般形式的完整推导；P10–P11 用 Gauss/Green 公式推二维弱形式；
> P11–P12 讲 `node`/`elem` 数据格式与矩形双线性单元）

这一节把 P4–P7 的"杆件专用"流程抽象成**通用格式**，然后推广到二维。
学完这一节，理论上你已经可以手写一个一维/二维有限元程序了。

## 一、课堂内容规范化整理（非逐字） {#kp-06-01}

### 1. 一般二阶非齐次常微分方程（P8） {#kp-06-02}

**一般二阶非齐次常微分方程**（笔记写"有限元之法"）：

$$
-\frac{\mathrm d}{\mathrm dx}\left(p(x)\frac{\mathrm du(x)}{\mathrm dx}\right)+q(x)u(x)=f(x),
\qquad 0<x<L
\qquad(1)
$$

定解条件：

$$
u(x)=u_0,\quad x=0
\qquad\text{（第一类边界条件：强制/本质边界条件，Dirichlet）}
\qquad(2)
$$

$$
p(x)\frac{\mathrm du}{\mathrm dx}+\alpha u(x)=g,\quad x=L
\qquad\text{（}\alpha=0\text{ 时为第二类 Neumann；}\alpha\neq0\text{ 时为第三类 Cauchy）}
\qquad(3)
$$

系数要求：$p(x)>0$，$q(x)\ge0$，$x\in[0,L]$，$\alpha\ge0$。

- **齐次**：$f(x)=0$、$u_0=0$、$g=0$；
- **非齐次**：上述条件中有一项不满足。

**1° 构造弱解形式**：引入 $\bar u(x)\in V=\{v\in H^1(0,L):v(0)=0\}$ 且 $\bar u(0)=0$，乘入方程 (1)，
在 $[0,L]$ 上积分：

$$
\int_0^L-\frac{\mathrm d}{\mathrm dx}\left(p\frac{\mathrm du}{\mathrm dx}\right)\bar u\,\mathrm dx
+\int_0^L q(x)u\bar u\,\mathrm dx=\int_0^L f(x)\bar u\,\mathrm dx
$$

分部积分（利用 $\left.p\dfrac{\mathrm du}{\mathrm dx}\right|_{x=L}=-\alpha u(L)+g$）：

$$
\int_0^L p\frac{\mathrm du}{\mathrm dx}\frac{\mathrm d\bar u}{\mathrm dx}\,\mathrm dx
-\left.p\frac{\mathrm du}{\mathrm dx}\bar u\right|_0^L
+\int_0^L qu\bar u\,\mathrm dx=\int_0^L f\bar u\,\mathrm dx
$$

整理得

$$
\int_0^L p\,u'\bar u'\,\mathrm dx+\int_0^L qu\bar u\,\mathrm dx+\alpha u(L)\bar u(L)
=\int_0^L f\bar u\,\mathrm dx+g\bar u(L)
\qquad(4)
$$

方程 (4) 称为方程 (1)–(3) 的**弱解形式**：

- 第一类边界条件 $u(0)=u_0$ 是**强制边界条件（本质边界条件）**，必须事先引入；
- 第二、三类边界条件在分部积分中**自然引入**，故称**自然边界条件**。

**2. 离散**：将 $[0,L]$ 分为 $n$ 个互不重叠的区域（单元）$e_i=[x_{i-1},x_i]$，
$i=1,\cdots,n$；共 $n+1$ 个节点、$n$ 个单元。方程 (4) 改写为

$$
\sum_{i=1}^{n}\int_{e_i}p\frac{\mathrm du}{\mathrm dx}\frac{\mathrm d\bar u}{\mathrm dx}\,\mathrm dx
+\sum_{i=1}^{n}\int_{e_i}qu\bar u\,\mathrm dx+\alpha u(L)\bar u(L)
=\sum_{i=1}^{n}\int_{e_i}f\bar u\,\mathrm dx+g\bar u(L)
$$

### 2. 单元分析（P9） {#kp-06-03}

**3. 单元分析**（局部编号 $1,2$；整体编号 $i-1,i$）

$$
u(x)=\begin{bmatrix}N_{i-1}(x)&N_i(x)\end{bmatrix}
\begin{bmatrix}u_{i-1}\\u_i\end{bmatrix}
=[N(x)]_e\{u\}_e
$$

$$
\frac{\mathrm d}{\mathrm dx}u(x)
=\begin{bmatrix}\dfrac{\mathrm dN_{i-1}}{\mathrm dx}&\dfrac{\mathrm dN_i}{\mathrm dx}\end{bmatrix}\{u\}_e
=[B]_e\{u\}_e
$$

$$
\begin{aligned}
\int_{e_i}p(x)\frac{\mathrm du}{\mathrm dx}\frac{\mathrm d\bar u}{\mathrm dx}\,\mathrm dx
&=\int_{e_i}([B]\{u\})^{\mathrm T}p\,([B]\{\bar u\})\,\mathrm dx\\
&=\{\bar u\}_e^{\mathrm T}\left[\int_{e_i}[B]^{\mathrm T}p(x)[B]\,\mathrm dx\right]\{u\}_e
=\{\bar u\}_e^{\mathrm T}[K]_e\{u\}_e
\end{aligned}
$$

$$
\int_{e_i}q(x)u\bar u\,\mathrm dx
=\{\bar u\}_e^{\mathrm T}\left[\int_{x_{i-1}}^{x_i}[N]^{\mathrm T}q(x)[N]\,\mathrm dx\right]\{u\}_e
$$

**单元刚度矩阵**：

$$
[K]_e=\int_{e_i}[B]^{\mathrm T}p[B]\,\mathrm dx+\int_{e_i}[N]^{\mathrm T}q[N]\,\mathrm dx
$$

- $[B]^{\mathrm T}p[B]$：当 $u_i=u_{i-1}$ 时为零（刚体平移不产生内力）；
- $[N]^{\mathrm T}q[N]$：对称；
- 正定性来自整体能量和边界约束；本题已有左端 Dirichlet 条件，故不要求 $\alpha>0$。

### 3. 二维 Poisson 方程（P10–P11） {#kp-06-04}

**4. 二阶 Poisson 方程有限元方法**

$$
\begin{cases}
\nabla\cdot k\nabla u+f=0, & \text{in }\Omega\\[6pt]
u=u_0, & \text{on }\Omega_1\\[6pt]
k\dfrac{\partial u}{\partial n}+\alpha u=g, & \text{on }\partial\Omega_2\cup\partial\Omega_3
\end{cases}
$$

其中 $k>0$，$\alpha\ge0$；$\alpha=0$ 时（3）为第二类边界条件，$\alpha>0$ 时为第三类。

**1° 构建弱解形式（广义解）**

取 $\bar u(x,y)\in V=\{v\in H^1(\Omega):v|_{\Gamma_D}=0\}$ 且 $\bar u\vert_{\partial\Omega_1}=0$，乘入方程 (1) 后在 $\Omega$ 上积分：

$$
\iint_\Omega\left(\nabla\cdot k\nabla u+f\right)\bar u\,\mathrm d\Omega=0
\qquad\Longrightarrow\qquad
-\iint_\Omega\nabla\cdot k\nabla u\,\bar u\,\mathrm d\Omega=\iint_\Omega f\bar u\,\mathrm d\Omega
$$

**应用 Gauss 公式**（令 $P,Q,R\in C^1$ 且在 $\partial\Omega$ 上一阶连续可微）：

$$
\int_\Omega\left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\right)\mathrm d\Omega
=\oint_{\partial\Omega}\left(P\cos(\boldsymbol n,x)+Q\cos(\boldsymbol n,y)+R\cos(\boldsymbol n,z)\right)\mathrm dS
$$

取 $P=k\dfrac{\partial u}{\partial x}\bar u$、$Q=k\dfrac{\partial u}{\partial y}\bar u$、$R=k\dfrac{\partial u}{\partial z}\bar u$，
由乘积求导法则得

$$
\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}
=\nabla\cdot k\nabla u\,\bar u+k\nabla u\cdot\nabla\bar u
$$

$$
-\iiint_\Omega\nabla\cdot k\nabla u\,\bar u\,\mathrm d\Omega
=\iiint_\Omega k\nabla u\cdot\nabla\bar u\,\mathrm d\Omega-\oint_{\partial\Omega}k\frac{\partial u}{\partial n}\bar u\,\mathrm dS
$$

$$
\boxed{-\int_\Omega\nabla\cdot k\nabla u\,\bar u\,\mathrm d\Omega
=\int_\Omega k\nabla u\cdot\nabla\bar u\,\mathrm d\Omega-\oint_{\partial\Omega}k\frac{\partial u}{\partial n}\bar u\,\mathrm dS}
\qquad\text{（Green 公式）}
$$

$$
\iint_\Omega k\nabla u\cdot\nabla\bar u\,\mathrm dx\,\mathrm dy+\int_{\partial\Omega_3}\alpha u\bar u\,\mathrm dS
=\iint_\Omega f\bar u\,\mathrm dx\,\mathrm dy+\int_{\partial\Omega_2\cup\partial\Omega_3}g\bar u\,\mathrm dS
\qquad(4)
$$

方程 (4) 是方程 (1)–(3) 的**弱形式**。

**2° 离散**

$$
\sum_i\int_{e_i}k\nabla u\cdot\nabla\bar u\,\mathrm d\Omega+\sum_j\int_{e_j}\alpha u\bar u\,\mathrm dS
=\sum_i\int_{e_i}f\bar u\,\mathrm d\Omega+\sum_j\int_{e_j}g\bar u\,\mathrm dS
$$

左端两项分别对应**单元刚度矩阵**与**边界条件矩阵**，右端两项对应**单元载荷向量**与边界载荷；
$e_i$ 为体单元（内部单元），$e_j$ 为边界单元。随后求解代数方程组。

**单元划分的数据格式**：

```text
(1) node 文件            (2) elem 文件
1 2 3 … 节点坐标          单元连接：1 2 5 4 / 2 3 6 5 / 5 6 9 8 …
(n_x+1)(n_y+1) 个节点      n_x × n_y 个单元
```

**3. 单元分析（矩形双线性单元）**

$$
N_j(x,y)=\frac{(x-x_1)(y-y_1)}{(x_2-x_1)(y_2-y_1)}
$$

$$
\begin{aligned}
M_1(x,y)&=N_1(x)N_1(y)=\frac{x_2-x}{x_2-x_1}\cdot\frac{y_2-y}{y_2-y_1}\\
M_2(x,y)&=N_2(x)N_1(y)=\frac{x-x_1}{x_2-x_1}\cdot\frac{y_2-y}{y_2-y_1}\\
M_3(x,y)&=N_2(x)N_2(y)=\frac{x-x_1}{x_2-x_1}\cdot\frac{y-y_1}{y_2-y_1}\\
M_4(x,y)&=N_1(x)N_2(y)=\frac{x_2-x}{x_2-x_1}\cdot\frac{y-y_1}{y_2-y_1}
\end{aligned}
$$

$$
N_1(x)+N_2(x)\equiv1,\qquad N_i(x_j)=\delta_{ij}
$$

$$
\sum_{i=1}^{4}N_i(x,y)\equiv1,\qquad N_i(x_j,y_j)=\delta_{ij}
$$

$$
\frac{\partial u}{\partial x}
=\frac{\partial}{\partial x}\begin{bmatrix}N_1(x,y)&N_2&N_3&N_4\end{bmatrix}\{u\}
=\begin{bmatrix}\dfrac{\partial N_1}{\partial x}&\cdots&\dfrac{\partial N_4}{\partial x}\end{bmatrix}\{u\}
$$

$$
\nabla u=\begin{bmatrix}\partial u/\partial x\\[4pt]\partial u/\partial y\end{bmatrix}
=\begin{bmatrix}
\dfrac{\partial N_1}{\partial x} & \cdots & \dfrac{\partial N_4}{\partial x}\\[8pt]
\dfrac{\partial N_1}{\partial y} & \cdots & \dfrac{\partial N_4}{\partial y}
\end{bmatrix}\{u\}
=[B(x,y)]\{u\}_e\qquad(2\times4)
$$

## 二、补充推导：一维一般形式 {#kp-06-05}

### 2.1 弱形式逐步推导（把笔记跳的边界项写清） {#kp-06-06}

设 $u$ 满足 (1)，$\bar u\in H^1$ 且 $\bar u(0)=0$。乘 $\bar u$ 后积分：

$$
\int_0^L\left[-\frac{\mathrm d}{\mathrm dx}\left(p\frac{\mathrm du}{\mathrm dx}\right)+qu\right]\bar u\,\mathrm dx=\int_0^L f\bar u\,\mathrm dx
$$

分部积分第一项：

$$
-\int_0^L\frac{\mathrm d}{\mathrm dx}\left(p u'\right)\bar u\,\mathrm dx
=-p u'\bar u\Big|_0^L+\int_0^L p u'\bar u'\,\mathrm dx
$$

边界项：

$$
-p u'\bar u\Big|_0^L=-p(L)u'(L)\bar u(L)+p(0)u'(0)\underbrace{\bar u(0)}_{=0}
=-\left(-\alpha u(L)+g\right)\bar u(L)=\alpha u(L)\bar u(L)-g\bar u(L)
$$

代入整理即得 (4)。**注意三件事**：

1. 左端的 $u$ 与 $\bar u$ 地位对称，所以离散后矩阵必**对称**；
2. $x=L$ 处的 $\alpha u(L)$ 项跑到左端（进入矩阵），$g$ 跑到右端（进入载荷）；
3. $x=0$ 处边界项之所以消失，全靠 $\bar u(0)=0$。

### 2.2 齐次/非齐次的判定与意义 {#kp-06-07}

笔记写了判定条件，但要理解**为什么关心齐次**：

- 若 $f=0,u_0=0,g=0$，那么 $u\equiv0$ 是一个解，问题的解就是"零解+扰动"结构，便于理论分析（特征值、稳定性）；
- 非齐次问题可以通过**叠加**分解为"非齐次边值 + 齐次边值"两部分来处理；
- 能量极小也可直接在满足非齐次边界值的仿射空间上表述；通过提升 $u=w+u_g$ 可转成齐次未知量 $w$。

### 2.3 单元矩阵的两个组成部分 {#kp-06-08}

$$
[K]_e=\underbrace{\int_{e_i}[B]^\mathrm Tp(x)[B]\,\mathrm dx}_{\text{主导项，来自 }p\text{ 项}}+\underbrace{\int_{e_i}[N]^\mathrm Tq(x)[N]\,\mathrm dx}_{\text{来自 }q\text{ 项（如弹性地基、对流散热）}}
$$

线性单元时：

$$
\int_{e_i}p[B]^\mathrm T[B]\,\mathrm dx=\frac{p}{l_i}\begin{bmatrix}1&-1\\-1&1\end{bmatrix},\qquad
\int_{e_i}q[N]^\mathrm T[N]\,\mathrm dx=\frac{ql_i}{6}\begin{bmatrix}2&1\\1&2\end{bmatrix}
$$

（第二个矩阵叫"质量矩阵"形状，系数 $\frac{l}{6}\begin{bmatrix}2&1\\1&2\end{bmatrix}$ 来自 $\int N_iN_j$。）
在 $p>0,q\ge0$ 时两者都对称半正定；若 $q$ 在单元上为正常数，则 $q$ 项严格正定；$q=0$ 时该项为零。
所以笔记 P9 写"$[B]^\mathrm Tp[B]$ 当 $u_i=u_{i-1}$ 时为 0"（表示刚体平移不耗能），
"$\alpha>0$ 保证正定"（端部弹簧或对流项消除了刚体自由度）。
若 $q=0$ 且 $\alpha=0$，必须有第一类边界条件，否则矩阵奇异。

## 三、补充推导：二维 Poisson 弱形式（P10 的核心） {#kp-06-09}

### 3.1 出发点 {#kp-06-10}

$$
\nabla\cdot(k\nabla u)+f=0\quad(\Omega),\qquad
u=u_0\quad(\partial\Omega_1),\qquad
k\frac{\partial u}{\partial n}+\alpha u=g\quad(\partial\Omega_2\cup\partial\Omega_3)
$$

取 $\bar u$ 满足 $\bar u|_{\partial\Omega_1}=0$（对应第一类边界条件），乘 $\bar u$ 积分：

$$
-\int_\Omega \nabla\cdot(k\nabla u)\bar u\,\mathrm d\Omega=\int_\Omega f\bar u\,\mathrm d\Omega
$$

### 3.2 用 Gauss 公式把体积分换成面积分 {#kp-06-11}

笔记的推导顺序是"**先构造一个恒等式，再对号入座**"：

$$
\int_\Omega\left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\right)\mathrm d\Omega
=\oint_{\partial\Omega}\Big(P\cos(\boldsymbol n,x)+Q\cos(\boldsymbol n,y)+R\cos(\boldsymbol n,z)\Big)\mathrm dS
$$

取 $P=k\frac{\partial u}{\partial x}\bar u,\ Q=k\frac{\partial u}{\partial y}\bar u,\ R=k\frac{\partial u}{\partial z}\bar u$，
由乘积求导法则：

$$
\frac{\partial P}{\partial x}=\frac{\partial}{\partial x}(k\partial_xu)\bar u+k\frac{\partial u}{\partial x}\frac{\partial\bar u}{\partial x},\quad\cdots
\qquad\Longrightarrow\qquad
\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}
=\nabla\cdot(k\nabla u)\,\bar u+k\nabla u\cdot\nabla\bar u
$$

代回 Gauss 公式即得（笔记里框起来的那个式子）：

$$
\boxed{-\int_\Omega\nabla\cdot(k\nabla u)\,\bar u\,\mathrm d\Omega
=\int_\Omega k\nabla u\cdot\nabla\bar u\,\mathrm d\Omega-\oint_{\partial\Omega}k\frac{\partial u}{\partial n}\bar u\,\mathrm dS}
$$

这就是二维版本的"分部积分"，也叫**格林（Green）第一公式**。

### 3.3 边界积分的分配（笔记 P10 最后几行） {#kp-06-12}

$$
\oint_{\partial\Omega}k\frac{\partial u}{\partial n}\bar u\,\mathrm dS
=\int_{\partial\Omega_1}+\int_{\partial\Omega_2}+\int_{\partial\Omega_3}
$$

| 边界段 | 已知条件 | 积分贡献 |
| --- | --- | --- |
| $\partial\Omega_1$（第一类） | $u=u_0$、$\bar u=0$ | **$0$**（检验函数为零，项自动消失） |
| $\partial\Omega_2$（第二类） | $k\partial u/\partial n=g$ | $\displaystyle\int_{\partial\Omega_2}g\bar u\,\mathrm dS$（移到右端） |
| $\partial\Omega_3$（第三类） | $k\partial u/\partial n=g-\alpha u$ | $\displaystyle\int_{\partial\Omega_3}\left(g\bar u-\alpha u\bar u\right)\mathrm dS$，其中 $\alpha u\bar u$ 留在左端进入矩阵 |

合并左边全部项、右边全部项，就得到 P11 的方程 (4)：

$$
\boxed{\int_\Omega k\nabla u\cdot\nabla\bar u\,\mathrm d\Omega+\int_{\partial\Omega_3}\alpha u\bar u\,\mathrm dS
=\int_\Omega f\bar u\,\mathrm d\Omega+\int_{\partial\Omega_2\cup\partial\Omega_3}g\bar u\,\mathrm dS}
$$

> 这一式与一维的 (4) 完全同构：**左端是"能量型"的双线性项（进矩阵），右端是"载荷型"的线性项（进右端）**。
> 唯一的区别是二维多了一个**边界积分**——它由边界单元承担。

### 3.4 离散与三类矩阵的对应 {#kp-06-13}

$$
\sum_{i}\underbrace{\int_{e_i}k\nabla u\cdot\nabla\bar u\,\mathrm d\Omega}_{\text{单元刚度矩阵}}
+\sum_{j}\underbrace{\int_{e_j}\alpha u\bar u\,\mathrm dS}_{\text{边界刚度矩阵（第三类边界条件）}}
=\sum_{i}\underbrace{\int_{e_i}f\bar u\,\mathrm d\Omega}_{\text{单元载荷向量}}
+\sum_{j}\underbrace{\int_{e_j}g\bar u\,\mathrm dS}_{\text{边界载荷向量}}
$$

- 内部单元 $e_i$：$[K]^e=\int_{e_i}[B]^\mathrm Tk[B]\,\mathrm d\Omega$；
- 边界单元 $e_j$（在第三类边界上形成矩阵、在第二/三类边界上形成载荷）：$[K]^e_{\partial}=\int_{e_j}\alpha[N]^\mathrm T[N]\,\mathrm dS$，
  $\{f\}^e_{\partial}=\int_{e_j}g[N]^\mathrm T\,\mathrm dS$。

## 四、数据格式：`node` 与 `elem`（工程实现的第一课） {#kp-06-14}

笔记专门留了一块讲这个，因为它决定程序的写法和矩阵带宽：

**`node` 文件**（节点坐标）：矩形区域 $n_x\times n_y$ 个单元，则节点数为 $(n_x+1)(n_y+1)$。
按行（先 $x$ 后 $y$）编号：

$$
\text{节点号}(i,j)=(j-1)(n_x+1)+i,\qquad i=1,\dots,n_x+1,\ j=1,\dots,n_y+1
$$

**`elem` 文件**（单元连接表）：每个单元记录 4 个角的节点号，且要**一致地排序**
（逆时针或顺时针，全网格统一，否则某些单元面积会算出负值）。
笔记里给的例子（$2\times2$ 网格，9 个节点、4 个单元）：

```text
node                    elem
1  1.0  0.0             1   1  2  5  4
2  2.0  0.0             2   2  3  6  5
3  1.0  1.0             3   5  6  9  8   ← 示例网格更细时的编号
   ⋯                    ⋯
节点编号顺序 →         8 → 9 → 10 → 16 → 15（宽模板时用到）
```

**为什么编号顺序重要？** 未知量的排列顺序决定矩阵带宽：
只看边相邻节点，按行编号步幅为 $n_x+1$，按列为 $n_y+1$；Q4 单元还耦合对角角点，完整半带宽相应为 $n_x+2$ 或 $n_y+2$。
带状存储 + 带状求解器可以大幅节省内存与时间（P3 的"带状稀疏"在这里落地）。

## 五、矩形双线性单元（Q4 单元） {#kp-06-15}

### 5.1 形函数 {#kp-06-16}

在单元 $[x_1,x_2]\times[y_1,y_2]$ 上，四个角点的双线性形函数由**两个一维线性形函数相乘**得到：

$$
N_k(x,y)=N_i(x)N_j(y),\qquad N_1(x)=\frac{x_2-x}{x_2-x_1},\ N_2(x)=\frac{x-x_1}{x_2-x_1},\ \ldots
$$

具体四个（与笔记 M₁~M₄ 一致，按左下→右下→右上→左上排列）：

$$
\begin{aligned}
N_1&=\frac{(x_2-x)(y_2-y)}{(x_2-x_1)(y_2-y_1)} & N_2&=\frac{(x-x_1)(y_2-y)}{(x_2-x_1)(y_2-y_1)}\\
N_3&=\frac{(x-x_1)(y-y_1)}{(x_2-x_1)(y_2-y_1)} & N_4&=\frac{(x_2-x)(y-y_1)}{(x_2-x_1)(y_2-y_1)}
\end{aligned}
$$

性质（应掌握，现有材料不足以确认考试安排）：

1. **单位分解**：$\sum_{k=1}^4N_k(x,y)\equiv1$；
2. **Kronecker 性质**：$N_k(x_j,y_j)=\delta_{kj}$（自己节点为 1，其他节点为 0）；
3. 在单元边界上退化为**一维线性函数** ⟹ 相邻单元在公共边上**位移连续**（$C^0$ 单元）；
4. 双线性项 $xy$ 使它在单元内可以表示弯曲形状，但不含 $x^2,y^2$ 项（这是"双线性"而非"双二次"）。

### 5.2 应变矩阵 $[B]$（$2\times4$） {#kp-06-17}

$$
u(x,y)=\sum_{k=1}^4N_k(x,y)u_k=[N]\{u\}_e
$$

$$
\nabla u=\begin{bmatrix}\partial u/\partial x\\ \partial u/\partial y\end{bmatrix}
=\begin{bmatrix}
\partial N_1/\partial x & \partial N_2/\partial x & \partial N_3/\partial x & \partial N_4/\partial x\\
\partial N_1/\partial y & \partial N_2/\partial y & \partial N_3/\partial y & \partial N_4/\partial y
\end{bmatrix}\{u\}_e=[B(x,y)]\{u\}_e
$$

于是

$$
[K]^e=\int_{\Omega_e}k[B]^\mathrm T[B]\,\mathrm d\Omega\quad(4\times4),\qquad
\{f\}^e=\int_{\Omega_e}f[N]^\mathrm T\,\mathrm d\Omega\quad(4\times1)
$$

> 对比一维：$[B]$ 从 $1\times2$ 变成 $2\times4$，矩阵从 $2\times2$ 变成 $4\times4$，
> **但整个过程（$[B]^\mathrm T\cdot$系数$\cdot[B]$ 再积分）一字不变**。这就是有限元方法的魅力所在。

### 5.3 一般四边形与等参元（预告） {#kp-06-18}

上式只对**边平行于坐标轴**的矩形单元好用。对任意四边形，标准做法是引入参考坐标
$\xi,\eta\in[-1,1]$：

$$
N_k(\xi,\eta)=\frac14\left(1+\xi_k\xi\right)\left(1+\eta_k\eta\right),\qquad
[B]=[J]^{-\mathrm T}\begin{bmatrix}\partial N/\partial\xi\\\partial N/\partial\eta\end{bmatrix}
$$

其中明确约定 $J=\begin{bmatrix}x_\xi&x_\eta\\y_\xi&y_\eta\end{bmatrix}$，所以梯度变换必须使用 $J^{-\mathrm T}$。积分用 Gauss 数值积分在参考单元上做。这就是**等参元**，下一章内容。

## 六、常见误区 {#kp-06-19}

1. **Robin 系数与边界载荷分别处理**：$\alpha$ 贡献边界矩阵（通常含非对角元），$g$ 贡献右端；热对流边界有 $g=\alpha T_\infty$。
2. **边界矩阵只在第三类边界条件的边上出现**：第二类边界只贡献右端 $g$；第一类边界贡献为零。
3. **$[N]^\mathrm T[N]$ 与 $[B]^\mathrm T[B]$ 不能混**：前者来自 $q$ 项/边界 $\alpha$ 项（$4\times4$ 或 $2\times2$），
   后者来自 $p$ 项（同上但物理意义不同）。
4. **单元连接表的节点顺序必须一致**：否则三维/二维的体积（面积）计算会出现负值，刚度矩阵装配错乱。
5. **矩形单元 ≠ 三角形单元**：矩形单元要求区域是规则矩形网格；不规则区域必须用三角形或一般四边形（→ 面积坐标、等参元）。

## 七、复习要点 {#kp-06-20}

1. 能写出一般二阶 ODE 的弱形式，并说明三项边界条件各自的归宿。
2. 能写出 $[K]_e=\int[B]^\mathrm Tp[B]\mathrm dx+\int[N]^\mathrm Tq[N]\mathrm dx$，并算出线性单元的两个显式矩阵。
3. 能叙述 Gauss/Green 公式并独立推导出二维 Poisson 的弱形式（含"框起来"那个式子）。
4. 能写出四个双线性形函数并验证单位分解与 Kronecker 性质。
5. 能写出 $[B]_{2\times4}$ 的结构，并说明 $[K]^e$ 为什么是 $4\times4$ 对称阵。
6. 能说清 `node`/`elem` 文件的编号规则及其对带宽的影响。

## 八、预习衔接（下一步会讲什么） {#kp-06-21}

| 主题 | 要解决的问题 | 用到的工具 | 教材位置 |
| --- | --- | --- | --- |
| 三角形单元 | 任意区域的剖分 | 面积坐标（重心坐标）、$N_i=L_i$ | 姜礼尚第二、三章 |
| 等参元 | 任意四边形/曲边单元 | Jacobi 矩阵、坐标变换 | 姜礼尚第三章 |
| 数值积分 | $[K]^e$ 无法解析积分时 | Gauss-Legendre 积分、积分点表 | 数值分析第 4 章 |
| 二维弹性力学 | 位移→应变→应力 | 平面应力/应变矩阵 $[B]$、弹性矩阵 $[D]$ | 姜礼尚第四章 |
| 收敛性理论 | 为什么加密网格有效 | 插值误差估计、Céa 引理 | 姜礼尚第五章 |
| 特征值问题 | 结构自振频率 | 广义特征值 $[K]\{u\}=\lambda[M]\{u\}$ | 姜礼尚第六章 |
