export default defineAppConfig({
  pages:['pages/gallery/index','pages/category/index','pages/contact/index','pages/webview/index'],
  lazyCodeLoading:'requiredComponents',
  window:{navigationStyle:'custom',backgroundColor:'#f4f0e7',backgroundTextStyle:'dark'},
  rendererOptions:{skyline:{defaultDisplayBlock:true,defaultContentBox:true}}
})
