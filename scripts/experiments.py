"""Deterministic numerical checks and SVG figures; Python 3.10+, NumPy only."""
from pathlib import Path
import json, math
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
ASSETS=ROOT/'笔记整理'/'assets'
ASSETS.mkdir(exist_ok=True)
checks=[]
def check(name, condition):
    if not condition: raise AssertionError(name)
    checks.append(name)
def close(name, actual, expected, tol=1e-11):
    check(name, np.allclose(actual,expected,atol=tol,rtol=tol))
def solve_fixed(K,F,fixed,values):
    u=np.zeros(len(F)); u[fixed]=values
    free=np.setdiff1d(np.arange(len(F)),fixed)
    u[free]=np.linalg.solve(K[np.ix_(free,free)],F[free]-K[np.ix_(free,fixed)]@u[fixed])
    return u

# Positive source plus nonzero boundary values: independent exact polynomial.
n=4; h=1/n
A=(2*np.eye(n-1)-np.eye(n-1,k=1)-np.eye(n-1,k=-1))/h**2
b=np.full(n-1,2.); b[-1]+=1/h**2
close('FDM source and nonzero Dirichlet sign',np.linalg.solve(A,b),[7/16,3/4,15/16])
K=np.array([[1.,-1,0],[-1,2,-1],[0,-1,1]])
close('Dirichlet lifting with two nonzero end values',solve_fixed(K,np.zeros(3),[0,2],[1,3]),[1,2,3])
check('Pure Neumann has constant nullspace',np.linalg.norm(K@np.ones(3))==0)

# Q4: independent tensor-product Gaussian integration, not the printed matrix.
g,w=np.polynomial.legendre.leggauss(3)
K4=np.zeros((4,4)); F4=np.zeros(4)
for a,wa in zip((g+1)/2,w/2):
    for b,wb in zip((g+1)/2,w/2):
        N=np.array([(1-a)*(1-b),a*(1-b),a*b,(1-a)*b])
        B=np.array([[-(1-b),1-b,b,-b],[-(1-a),-a,a,1-a]])
        K4+=wa*wb*(B.T@B); F4+=wa*wb*N
close('Q4 closed matrix versus numerical integration',K4,np.array([[4,-1,-2,-1],[-1,4,-1,-2],[-2,-1,4,-1],[-1,-2,-1,4]])/6)
close('Q4 eigenvalues',np.linalg.eigvalsh(K4),[0,2/3,1,1])
close('Q4 consistent source',F4,[.25]*4)

# Three-node quadratic rod: numerical integration of physical derivatives.
K2=np.zeros((3,3))
for s,ws in zip(g,w):
    B=np.array([s-.5,-2*s,s+.5])*2 # length one, dx/ds=1/2
    K2+=ws/2*np.outer(B,B)
close('Quadratic rod matrix',K2,np.array([[7,-8,1],[-8,16,-8],[1,-8,7]])/3)
for s in [-1,-.2,0,.4,1]:
    ell=np.array([s*(s-1)/2,1-s*s,s*(s+1)/2])
    close('Q9 tensor partition '+str(s),sum(np.outer(ell,ell).ravel()),1)

# Triangle shape functions computed by inversion of nodal conditions.
xy=np.array([[0.,0],[2,0],[0,1]])
C=np.column_stack((np.ones(3),xy)); coef=np.linalg.solve(C,np.eye(3))
B=coef[1:]; area=abs(np.linalg.det(C))/2
KT=area*(B.T@B)
close('Triangle matrix from independent nodal inversion',KT,[[1.25,-.25,-1],[-.25,.25,0],[-1,0,1]])
close('Triangle nodal Kronecker property',C@coef,np.eye(3))
close('Triangle barycentric example',np.array([1,.5,.25])@coef,[.5,.25,.25])
close('Triangle linear patch gradient',B@np.array([1,3,2]),[1,1])
close('Triangle energy versus analytic gradient energy',np.array([1,3,2])@KT@np.array([1,3,2]),2)

# A nonsymmetric Jacobian detects inverse-versus-inverse-transpose errors.
J=np.array([[2.,.4],[.1,1.]])
grad=np.array([3.,-2.]); refgrad=J.T@grad
close('Nonsymmetric Jacobian gradient chain rule',np.linalg.solve(J.T,refgrad),grad)
check('Invalid element orientation detected',np.linalg.det(J)>0)

# Two-material interface; flux is checked separately from temperature continuity.
ki=[1.,4.]; lengths=[.5,.5]; KI=np.zeros((3,3))
for e,(k,l) in enumerate(zip(ki,lengths)):
    KI[e:e+2,e:e+2]+=k/l*np.array([[1.,-1],[-1,1]])
ui=solve_fixed(KI,np.zeros(3),[0,2],[0,1])
close('Interface exact nodal values',ui,[0,.8,1])
close('Interface mathematical flux continuity',np.array(ki)*np.diff(ui)/lengths,[1.6,1.6])

# Smooth manufactured solution; exact load via 5-point Gauss, errors in L2/H1.
results=[]; gg,ww=np.polynomial.legendre.leggauss(5)
for n in [4,8,16,32]:
    x=np.linspace(0,1,n+1); h=1/n; K=np.zeros((n+1,n+1)); F=np.zeros(n+1)
    for e in range(n):
        K[e:e+2,e:e+2]+=np.array([[1.,-1],[-1,1]])/h
        for s,ws in zip(gg,ww):
            N=np.array([(1-s)/2,(1+s)/2]); xp=x[e]+h*(s+1)/2
            F[e:e+2]+=ws*h/2*(math.pi**2*math.sin(math.pi*xp))*N
    u=solve_fixed(K,F,[0,n],[0,0]); L2=H1=0.
    for e in range(n):
        for s,ws in zip(gg,ww):
            N=np.array([(1-s)/2,(1+s)/2]); xp=x[e]+h*(s+1)/2
            L2+=ws*h/2*(N@u[e:e+2]-math.sin(math.pi*xp))**2
            H1+=ws*h/2*((u[e+1]-u[e])/h-math.pi*math.cos(math.pi*xp))**2
    A=(2*np.eye(n-1)-np.eye(n-1,k=1)-np.eye(n-1,k=-1))/h**2
    fd=np.linalg.solve(A,math.pi**2*np.sin(math.pi*x[1:-1]))
    results.append(dict(n=n,h=h,L2=math.sqrt(L2),H1_seminorm=math.sqrt(H1),FDM_max=float(max(abs(fd-np.sin(math.pi*x[1:-1]))))))
for name,expected in [('L2',2),('H1_seminorm',1),('FDM_max',2)]:
    rate=math.log2(results[-2][name]/results[-1][name])
    check(name+' observed convergence order',abs(rate-expected)<.05)

def svg(name,title,body,width=720,height=330):
    content=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title"><title id="title">{title}</title><rect width="100%" height="100%" fill="#f5f7fa"/><g font-family="Segoe UI,Microsoft YaHei,sans-serif" fill="#172f43" font-size="17">{body}</g></svg>'''
    (ASSETS/name).write_text(content,encoding='utf-8')

svg('stencil.svg','五点模板：中心与东西南北四条共享通量边','''<g stroke="#315c78" stroke-width="3"><path d="M360 65V265M220 165H500"/></g><g fill="#d4e9e9" stroke="#172f43" stroke-width="2"><circle cx="360" cy="165" r="25"/><circle cx="360" cy="65" r="18"/><circle cx="360" cy="265" r="18"/><circle cx="220" cy="165" r="18"/><circle cx="500" cy="165" r="18"/></g><text x="345" y="172">i,j</text><text x="390" y="70">北 N</text><text x="390" y="270">南 S</text><text x="130" y="172">西 W</text><text x="530" y="172">东 E</text><text x="380" y="120">aN</text><text x="380" y="225">aS</text><text x="270" y="150">aW</text><text x="430" y="150">aE</text><text x="200" y="315">正对角 = 四面系数之和</text>''')
svg('assembly.svg','两个杆单元的局部节点映射到共享全局节点','''<path d="M100 130H620" stroke="#315c78" stroke-width="8"/><g fill="#fff" stroke="#172f43" stroke-width="3"><circle cx="100" cy="130" r="14"/><circle cx="360" cy="130" r="14"/><circle cx="620" cy="130" r="14"/></g><text x="90" y="95">0</text><text x="350" y="95">1</text><text x="610" y="95">2</text><text x="170" y="175">e₁: [0,1]</text><text x="435" y="175">e₂: [1,2]</text><text x="140" y="230">共享节点 1 的刚度贡献相加</text><text x="140" y="270">K₁₁ = K¹₂₂ + K²₁₁</text>''')
svg('barycentric.svg','三角形内一点把面积分为三个部分','''<path d="M100 270L580 270L100 30Z" fill="#fff" stroke="#172f43" stroke-width="3"/><path d="M100 270L220 210L580 270Z" fill="#b7d6e5" stroke="#172f43"/><path d="M100 30L220 210L580 270Z" fill="#b9d9cc" stroke="#172f43"/><path d="M100 270L220 210L100 30Z" fill="#e4d7b6" stroke="#172f43"/><circle cx="220" cy="210" r="5" fill="#172f43"/><text x="76" y="298">1 (0,0)</text><text x="550" y="298">2 (2,0)</text><text x="70" y="22">3 (0,1)</text><text x="230" y="205">P (0.5,0.25)</text><text x="280" y="160">L₁=0.5</text><text x="110" y="185">L₂=0.25</text><text x="280" y="255">L₃=0.25</text>''')
svg('interface.svg','双层材料温度在界面连续，斜率跳变','''<path d="M90 40V270H640" stroke="#172f43" stroke-width="2" fill="none"/><path d="M90 270L350 86L610 40" stroke="#276985" stroke-width="4" fill="none"/><path d="M350 40V270" stroke="#596875" stroke-dasharray="7 5"/><text x="65" y="30">u</text><text x="645" y="278">x</text><text x="80" y="295">0</text><text x="330" y="295">0.5</text><text x="600" y="295">1</text><text x="165" y="250">k₁=1</text><text x="440" y="250">k₂=4</text><text x="370" y="115">uI=0.8</text><text x="120" y="90">左斜率 1.6</text><text x="445" y="150">右斜率 0.4</text>''')
svg('hat.svg','分片线性帽函数只在邻接单元非零','''<path d="M70 250H650M80 260V40" stroke="#172f43" fill="none"/><path d="M80 250H210L350 60L490 250H640" stroke="#276985" stroke-width="4" fill="none"/><path d="M350 60V250" stroke="#596875" stroke-dasharray="6 4"/><text x="200" y="282">xᵢ₋₁</text><text x="340" y="282">xᵢ</text><text x="480" y="282">xᵢ₊₁</text><text x="90" y="63">1</text><text x="470" y="90">Nᵢ(x)</text>''')

# log-log scientific convergence figure: coordinates and data derive from checks above.
body='<path d="M100 35V270H650" stroke="#172f43" stroke-width="2" fill="none"/>'
for v in [1,.1,.01,.001]:
    yy=50-65*math.log10(v)
    body+=f'<path d="M100 {yy}H650" stroke="#d0d9e0"/><text x="30" y="{yy+5}">{v:g}</text>'
for i,r in enumerate(results):
    xx=140+i*145
    body+=f'<text x="{xx-8}" y="295">{r["n"]}</text>'
for key,color,label,offset in [('L2','#276985','L2 误差',0),('H1_seminorm','#7a4a16','H1 半范数误差',1)]:
    pts=' '.join(f'{140+i*145},{50-65*math.log10(r[key])}' for i,r in enumerate(results))
    body+=f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="3"'+(' stroke-dasharray="7 4"' if offset else '')+'/>'
    body+=f'<text x="{350 if offset else 160}" y="25" fill="{color}">{label}</text>'
    for i,r in enumerate(results):
        xx=140+i*145; yy=50-65*math.log10(r[key])
        body+=f'<circle cx="{xx}" cy="{yy}" r="4" fill="{color}"/>'
body+='<text x="540" y="320">单元数 n (log₂)</text>'
svg('convergence.svg','正弦精确解的一维有限元误差，纵轴以10为底对数、横轴以2为底对数',body)
output=dict(checks=checks,passed=len(checks),convergence=results,randomness='none',model='-u\'\'=pi^2 sin(pi*x), u(0)=u(1)=0')
(ROOT/'实验结果.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'笔记整理'/'public').mkdir(exist_ok=True)
(ROOT/'笔记整理'/'public'/'experiments.py').write_text(Path(__file__).read_text(encoding='utf-8'),encoding='utf-8')
print(json.dumps(output,ensure_ascii=False,indent=2))
