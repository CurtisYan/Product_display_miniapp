export default defineAppConfig({
  entryPagePath:'pages/gallery/index',
  pages:['pages/gallery/index','pages/category/index','pages/contact/index','pages/webview/index'],
  lazyCodeLoading:'requiredComponents',
  window:{navigationStyle:'custom',backgroundColor:'#f4f0e7',backgroundTextStyle:'dark'},
  tabBar:{
    color:'#77766f',
    selectedColor:'#20211d',
    backgroundColor:'#f4f0e7',
    borderStyle:'white',
    list:[
      {pagePath:'pages/gallery/index',text:'展厅',iconPath:'assets/tabbar/gallery.png',selectedIconPath:'assets/tabbar/gallery-active.png'},
      {pagePath:'pages/category/index',text:'分类',iconPath:'assets/tabbar/category.png',selectedIconPath:'assets/tabbar/category-active.png'},
      {pagePath:'pages/contact/index',text:'联系',iconPath:'assets/tabbar/contact.png',selectedIconPath:'assets/tabbar/contact-active.png'}
    ]
  },
  rendererOptions:{skyline:{defaultDisplayBlock:true,defaultContentBox:true}}
})
