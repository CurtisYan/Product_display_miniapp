export default defineAppConfig({
  entryPagePath:'pages/gallery/index',
  pages:['pages/gallery/index','pages/category/index','pages/contact/index','pages/webview/index'],
  lazyCodeLoading:'requiredComponents',
  window:{navigationStyle:'custom',backgroundColor:'#f4f0e7',backgroundTextStyle:'dark'},
  tabBar:{
    color:'#20211d',
    selectedColor:'#ff6b4a',
    backgroundColor:'#f4f0e7',
    borderStyle:'black',
    list:[
      {pagePath:'pages/gallery/index',text:'展厅'},
      {pagePath:'pages/category/index',text:'分类'},
      {pagePath:'pages/contact/index',text:'联系'}
    ]
  },
  rendererOptions:{skyline:{defaultDisplayBlock:true,defaultContentBox:true}}
})
