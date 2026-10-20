// Local QA only: serve the built site with scripts blocked by response CSP.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve('笔记整理/.vitepress/dist'),port=4270
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.py':'text/plain; charset=utf-8'}
http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname))
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html')
  if(!fs.existsSync(file)&&fs.existsSync(file+'.html'))file+='.html'
  if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}
  res.setHeader('Content-Security-Policy',"script-src 'none'; object-src 'none'")
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream')
  fs.createReadStream(file).pipe(res)
}).listen(port,'127.0.0.1',()=>console.log('Script-blocked QA at http://127.0.0.1:'+port))
