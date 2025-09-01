<script>
import imagePreloader from './utils/imagePreloader.js'

export default {
  onLaunch: async function () {
    console.log('App Launch')
    
    // 预加载所有静态图片
    try {
      await imagePreloader.init()
      console.log('所有图片预加载完成')
    } catch (error) {
      console.error('图片预加载失败:', error)
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
</style>
