import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const dir='笔记整理',failures=[],notes=[],sha=s=>crypto.createHash('sha256').update(s).digest('hex')
const assert=(value,msg)=>{if(!value)failures.push(msg)}
const args=process.argv.slice(2),ci=args.includes('--ci'),update=args.includes('--update-baseline')
const files=fs.readdirSync(dir).filter(n=>n.endsWith('.md')&&n!=='README.md')
const docs=new Map(files.map(n=>[n,fs.readFileSync(path.join(dir,n),'utf8').replace(/\r\n/g,'\n')]))
const knowledge=JSON.parse(fs.readFileSync('knowledge.json','utf8'))
const coverage=JSON.parse(fs.readFileSync('coverage.json','utf8'))
const sources=JSON.parse(fs.readFileSync('sources.json','utf8'))
assert(new Set(knowledge.map(k=>k.id)).size===knowledge.length,'Duplicate knowledge IDs')
for(const k of knowledge)assert(docs.get(k.file)?.includes(`{#${k.id}}`),`Missing knowledge anchor ${k.id}`)
assert(coverage.filter(c=>c.source==='S01').length===15,'Expected 15 distinct classroom PDF page records')
assert(new Set(coverage.filter(c=>c.source==='S01').map(c=>c.page)).size===15,'Duplicate classroom page records')
for(const source of sources.filter(s=>s.id.startsWith('C')))assert(coverage.some(c=>c.source===source.id),'Unmapped photo '+source.id)
const snapshot={}
for(const [file,content] of docs){
  assert(!/\[\[[^\]]+\]\]/.test(content),`Unmigrated wiki link: ${file}`)
  assert((content.match(/^\$\$\s*$/gm)||[]).length%2===0,`Unbalanced block math: ${file}`)
  assert(!/```mermaid/.test(content),`Unrendered Mermaid: ${file}`)
  const ids=[...content.matchAll(/\{#([^}]+)\}/g)].map(m=>m[1])
  assert(new Set(ids).size===ids.length,`Duplicate ID in ${file}`)
  const math=[...content.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$([^$\n]+)\$(?!\$)/g)].map(m=>sha(m[1]||m[2]))
  snapshot[file]={ids,math,characters:content.length}
  for(const m of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
    let href=m[1].split(' ')[0]
    if(/^(https?:|mailto:|#)/.test(href))continue
    // downloads/ is produced by the build (site/downloads), validated in the HTML pass below.
    if(href.includes('downloads/'))continue
    const [target,anchor]=href.split('#')
    const local=target.startsWith('/')?path.join(dir,'public',target.slice(1)):path.resolve(dir,target)
    assert(fs.existsSync(local),`Broken source link ${file}: ${href}`)
    if(anchor&&target.endsWith('.md'))assert(fs.readFileSync(local,'utf8').includes(`{#${anchor}}`),`Missing target anchor ${href}`)
  }
}
for(const source of sources){
  if(fs.existsSync(source.path))assert(sha(fs.readFileSync(source.path))===source.sha256,`Source changed: ${source.path}`)
  else if(!ci)failures.push('Source missing locally: '+source.path)
}
if(ci)notes.push('CI: original books/photos intentionally excluded; manifest validated, file hashes checked when present')
const baselinePath='history/content-baseline.json'
if(update){
  const i=args.indexOf('--reason'),reason=args[i+1]
  assert(Boolean(reason),'Baseline update requires --reason with an explicit editorial explanation')
  if(!failures.length){fs.mkdirSync('history',{recursive:true});fs.writeFileSync(baselinePath,JSON.stringify(snapshot,null,2)+'\n');fs.appendFileSync('history/baseline-changes.jsonl',JSON.stringify({time:new Date().toISOString(),reason})+'\n')}
}else{
  assert(fs.existsSync(baselinePath),'Missing content baseline')
  if(fs.existsSync(baselinePath))for(const [name,old]of Object.entries(JSON.parse(fs.readFileSync(baselinePath,'utf8')))){
    if(name==='README.md')continue // folder note, deliberately not a site page
    const now=snapshot[name];assert(Boolean(now),'Baseline page removed: '+name)
    if(now){for(const id of old.ids)assert(now.ids.includes(id),'Historical anchor removed: '+id)
      for(const h of new Set(old.math))assert(now.math.includes(h),'Historical formula changed/removed: '+name+' '+h.slice(0,10))
      assert(now.characters>=old.characters*.85,'Large unexplained content reduction: '+name)}
  }
}
const experiment=JSON.parse(fs.readFileSync('实验结果.json','utf8'))
assert(experiment.passed>=24,'Numerical experiments have not passed')
const dist=path.resolve(dir,'..','site')
if(fs.existsSync(dist)){
  const all=[];function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true}))f.isDirectory()?walk(path.join(d,f.name)):f.name.endsWith('.html')&&all.push(path.join(d,f.name))}walk(dist)
  let math=0,links=0
  for(const [name,content]of docs){
    const output=path.join(dist,name.replace(/\.md$/,'.html'))
    assert(fs.existsSync(output),'Missing rendered page: '+name)
    if(fs.existsSync(output)){
      const html=fs.readFileSync(output,'utf8')
      const heading=content.match(/^# (.+)$/m)?.[1]
      if(heading)assert(html.includes(heading),'Build did not render heading: '+name)
    }
  }
  for(const file of all){const html=fs.readFileSync(file,'utf8');math+=(html.match(/class="katex"/g)||[]).length
    assert(!/katex-error/.test(html),'KaTeX error: '+file)
    for(const m of html.matchAll(/(?:href|src)="([^"<>]+)"/g)){
      let href=m[1];if(/^(https?:|mailto:|data:|javascript:)/.test(href))continue
      let [raw,anchor]=href.split('#');raw=decodeURIComponent(raw.split('?')[0])
      const base=process.env.BASE_PATH||'/'
      if(base!=='/'&&raw.startsWith(base))raw=raw.slice(base.length)
      let local=raw?raw.startsWith('/')?path.join(dist,raw.slice(1)):path.resolve(path.dirname(file),raw):file
      if(!fs.existsSync(local)&&fs.existsSync(local+'.html'))local+='.html'
      if(fs.existsSync(local)&&fs.statSync(local).isDirectory())local=path.join(local,'index.html')
      assert(fs.existsSync(local),`Broken HTML resource ${file}: ${href}`)
      if(anchor&&fs.existsSync(local)&&local.endsWith('.html')){
        const target=fs.readFileSync(local,'utf8'),id=decodeURIComponent(anchor)
        assert(target.includes(`id="${id}"`),`Broken HTML anchor ${file}: ${href}`)
      }links++
    }
  }
  assert(math>150,'Unexpectedly low KaTeX formula render count')
  notes.push(`${all.length} HTML pages; ${math} statically rendered math expressions; ${links} local link/resource references checked`)
}else notes.push('No build yet; HTML checks pending')
const result={passed:!failures.length,knowledge:knowledge.length,classroomRecords:coverage.length,notes,failures}
fs.writeFileSync('quality-results.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1
