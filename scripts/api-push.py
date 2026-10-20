#!/usr/bin/env python3
"""Push the local tracked source tree to GitHub via the git data API.

The git://https protocol to github.com is unreachable from this host, so we use
api.github.com (reachable through the local proxy). The local proxy blocks tree
POSTs whose entry path lies under ".github/workflows/" (returns 404), so we skip
those paths here -- the Actions workflow already exists in the remote tree and is
inherited through base_tree. We build the tree in chunks of CHUNK entries chained
via base_tree; any remote-only stale files remain (harmless for the Pages build).
"""
import subprocess, base64, json, sys, os, tempfile

REPO = "wly63227/UCAS-finite-element-analysis"
GH = r"C:/Program Files/GitHub CLI/gh.exe"
API = f"https://api.github.com/repos/{REPO}/git"
EXCLUDE = {"build-report.json", "coverage.json", "quality-results.json", "实验结果.json"}
# The local proxy returns 404 for tree POSTs whose path is under .github/workflows/,
# so we never rewrite the Actions workflow through the git-data API (it is inherited
# from the remote base_tree instead).
SKIP_PREFIXES = (".github/workflows/",)
CHUNK = 20

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def token():
    return subprocess.check_output([GH, "auth", "token"]).decode().strip()

TOK = token()

def api(method, path, data=None, retries=6):
    url = API + path
    cmd = ["curl", "-sS", "--max-time", "60", "-X", method,
           "-H", f"Authorization: Bearer {TOK}",
           "-H", "Accept: application/vnd.github+json",
           "-H", "User-Agent: deploy-script",
           "-w", "\n__HTTP__%{http_code}"]
    tmp = None
    if data is not None:
        tmp = tempfile.NamedTemporaryFile("w", delete=False, suffix=".json", encoding="utf-8")
        tmp.write(json.dumps(data, ensure_ascii=False))
        tmp.close()
        cmd += ["-H", "Content-Type: application/json",
                "-H", "X-GitHub-Api-Version: 2022-11-28",
                "--data-binary", "@" + tmp.name]
    for attempt in range(retries):
        r = run(cmd + [url])
        if r.returncode != 0:
            print(f"  curl rc={r.returncode}: {r.stderr[:160]}"); continue
        out = r.stdout
        code = 0
        if "__HTTP__" in out:
            out, c = out.rsplit("__HTTP__", 1); code = int(c.strip())
        try:
            j = json.loads(out)
        except Exception:
            print(f"  bad json http={code} attempt {attempt}: {out[:160]}"); continue
        if isinstance(j, dict) and "message" in j and code >= 400:
            if code in (401, 403):
                print(f"  AUTH/403 HTTP {code}: {out[:300]}"); sys.exit(2)
            print(f"  HTTP {code} attempt {attempt}: {out[:200]}"); continue
        if tmp:
            try: os.unlink(tmp.name)
            except OSError: pass
        return j
    print(f"  GIVING UP {method} {path}")
    sys.exit(3)

# 1) remote HEAD commit + its tree
ref = api("GET", "/refs/heads/main")
parent = ref["object"]["sha"]
commit = api("GET", f"/commits/{parent}")
base_tree = commit["tree"]["sha"]
print(f"remote HEAD = {parent}, base_tree = {base_tree}")

# 2) create blobs for local tracked files
files = run(["git", "-c", "core.quotePath=false", "ls-files"]).stdout.splitlines()
files = [f for f in files if f not in EXCLUDE and not f.startswith(SKIP_PREFIXES)]
sha_of = {}
for f in files:
    with open(f, "rb") as fh:
        content = fh.read()
    b64 = base64.b64encode(content).decode()
    blob = api("POST", "/blobs", {"content": b64, "encoding": "base64"})
    sha_of[f] = blob["sha"]
    print(f"  blob {sha_of[f][:10]}  {f}")

# 3) build tree in chunks of CHUNK entries chained via base_tree
entries = [{"path": f, "mode": ("100755" if f.endswith((".py", ".mjs")) else "100644"),
           "type": "blob", "sha": sha_of[f]} for f in files]
total_chunks = (len(entries) + CHUNK - 1) // CHUNK
cur = base_tree
for i in range(0, len(entries), CHUNK):
    chunk = entries[i:i + CHUNK]
    tree = api("POST", "/trees", {"base_tree": cur, "tree": chunk})
    cur = tree["sha"]
    print(f"  tree chunk {i // CHUNK + 1}/{total_chunks} -> {cur[:10]}")
final_tree = cur
print(f"final tree = {final_tree}  ({len(entries)} files; remote-only stale files remain)")

# 4) commit + update ref
new_commit = api("POST", "/commits", {
    "message": "完善有限元分析站点：静态生成器 + 公式渲染对齐 ML 库（API 推送）",
    "tree": final_tree,
    "parents": [parent],
})
print(f"commit = {new_commit['sha']}")
res = api("PATCH", "/refs/heads/main", {"sha": new_commit["sha"], "force": False})
print(f"ref updated: {res.get('ref')} -> {res.get('object', {}).get('sha')}")
print("DONE")
