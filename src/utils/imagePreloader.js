// 图片预加载工具类
class ImagePreloader {
  constructor() {
    this.preloadedImages = new Map()
    this.loadingPromises = new Map()
  }

  // 预加载单个图片
  preloadImage(src) {
    // 如果已经在加载中，返回现有的Promise
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)
    }

    // 如果已经加载过，直接返回
    if (this.preloadedImages.has(src)) {
      return Promise.resolve(this.preloadedImages.get(src))
    }

    // 创建新的加载Promise
    const loadPromise = new Promise((resolve, reject) => {
      // 在小程序中使用 uni.getImageInfo 来预加载图片
      uni.getImageInfo({
        src: src,
        success: (res) => {
          this.preloadedImages.set(src, res)
          this.loadingPromises.delete(src)
          console.log(`图片预加载成功: ${src}`)
          resolve(res)
        },
        fail: (err) => {
          this.loadingPromises.delete(src)
          console.error(`图片预加载失败: ${src}`, err)
          reject(err)
        }
      })
    })

    this.loadingPromises.set(src, loadPromise)
    return loadPromise
  }

  // 批量预加载图片
  preloadImages(srcs) {
    return Promise.allSettled(
      srcs.map(src => this.preloadImage(src))
    )
  }

  // 获取所有需要预加载的静态图片
  getStaticImages() {
    return [
      '/static/images/company/szmeisu.jpeg',
      '/static/images/company/WeChat-Business-Card.jpeg',
      '/static/logo.png'
    ]
  }

  // 初始化预加载（在应用启动时调用）
  async init() {
    console.log('开始预加载静态图片...')
    const staticImages = this.getStaticImages()
    
    try {
      const results = await this.preloadImages(staticImages)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      console.log(`预加载完成: ${successCount}/${staticImages.length} 张图片成功`)
      return results
    } catch (error) {
      console.error('预加载过程出错:', error)
      return []
    }
  }

  // 检查图片是否已预加载
  isPreloaded(src) {
    return this.preloadedImages.has(src)
  }

  // 获取预加载的图片信息
  getPreloadedImage(src) {
    return this.preloadedImages.get(src)
  }

  // 清空缓存
  clear() {
    this.preloadedImages.clear()
    this.loadingPromises.clear()
  }
}

// 创建单例实例
const imagePreloader = new ImagePreloader()

export default imagePreloader
