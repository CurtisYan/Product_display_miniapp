import { defineConfig } from '@tarojs/cli'
import path from 'node:path'
export default defineConfig({
  projectName:'美塑产品展示',date:'2026-07-12',designWidth:750,deviceRatio:{750:1},
  sourceRoot:'src',outputRoot:'dist',framework:'react',compiler:'webpack5',cache:{enable:false},
  alias:{'@':path.resolve(__dirname,'..','src')},
  mini:{
    postcss:{pxtransform:{enable:true},url:{enable:true},cssModules:{enable:false}}
  }
})
