import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
let commit=null,dirty=null
try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();dirty=Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim())}catch{}
fs.mkdirSync('笔记整理/public',{recursive:true})
for(const file of ['sources.json','coverage.json','knowledge.json','实验结果.json'])fs.copyFileSync(file,'笔记整理/public/'+file)
fs.copyFileSync('scripts/experiments.py','笔记整理/public/experiments.py')
fs.writeFileSync('笔记整理/public/version.json',JSON.stringify({name:'有限元分析教材',sourceCommit:commit,workingTreeDirty:dirty,builtAt:new Date().toISOString(),sourceReviewDate:'2026-10-20'},null,2)+'\n')
