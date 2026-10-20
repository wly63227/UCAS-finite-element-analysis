import { defineConfig } from 'vitepress'
import { readdirSync } from 'node:fs'
const chapters = readdirSync('笔记整理').filter(n => /^\d\d-.*\.md$/.test(n)).sort()
export default defineConfig({
  lang:'zh-CN',title:'有限元分析',description:'从守恒到弱形式、单元装配与材料界面的中文自学教材',
  base:process.env.BASE_PATH || '/',cleanUrls:true,markdown:{math:true},
  themeConfig:{
    siteTitle:'有限元分析 · 自学教材',
    nav:[{text:'开始学习',link:'/学习指南'},{text:'知识索引',link:'/知识点清单'},{text:'例题与实验',link:'/练习与实验'},{text:'资料追溯',link:'/来源覆盖'}],
    sidebar:[
      {text:'阅读入口',items:[{text:'课程首页',link:'/'},{text:'学习指南与符号',link:'/学习指南'},{text:'学习大纲',link:'/学习大纲'}]},
      {text:'系统化教材',items:chapters.map(n=>({text:n.replace('.md','').replace('-',' · '),link:'/'+n.replace('.md','')}))},
      {text:'查找与实践',items:['知识点清单','练习与实验','资料清单','来源覆盖','勘误','建设报告'].map(n=>({text:n,link:'/'+n}))}
    ],
    search:{provider:'local',options:{locales:{root:{translations:{button:{buttonText:'搜索教材',buttonAriaLabel:'搜索教材'},modal:{noResultsText:'未找到相关内容',resetButtonTitle:'清空',footer:{selectText:'选择',navigateText:'切换',closeText:'关闭'}}}}}}},
    outline:{level:[2,3],label:'本页内容'},docFooter:{prev:'上一节',next:'下一节'},
    darkModeSwitchLabel:'切换深色模式',sidebarMenuLabel:'章节目录',returnToTopLabel:'返回顶部',
    footer:{message:'课堂依据与解释补充分开记录 · PDF 物理页码从 1 开始',copyright:'核查日期 2026-10-20'}
  }
})
