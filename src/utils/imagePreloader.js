// 图片预加载工具类
class ImagePreloader {
  constructor() {
    this.preloadedImages = new Map()
    this.loadingPromises = new Map()
    this.cacheKey = 'imageCache_v1'
    this.maxCacheSize = 50 // 最大缓存图片数量
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000 // 7天过期时间
    
    // 从本地存储恢复缓存
    this.loadCacheFromStorage()
  }

  // 从本地存储加载缓存
  loadCacheFromStorage() {
    try {
      const cacheData = uni.getStorageSync(this.cacheKey)
      if (cacheData) {
        const { timestamp, images } = JSON.parse(cacheData)
        const now = Date.now()
        
        // 检查缓存是否过期
        if (now - timestamp < this.cacheExpiry) {
          images.forEach(({ src, info }) => {
            this.preloadedImages.set(src, info)
          })
          console.log(`从本地存储恢复了 ${images.length} 张图片缓存`)
        } else {
          console.log('本地图片缓存已过期，清除缓存')
          uni.removeStorageSync(this.cacheKey)
        }
      }
    } catch (error) {
      console.error('加载本地图片缓存失败:', error)
    }
  }

  // 保存缓存到本地存储
  saveCacheToStorage() {
    try {
      const images = Array.from(this.preloadedImages.entries()).map(([src, info]) => ({ src, info }))
      
      // 限制缓存大小
      if (images.length > this.maxCacheSize) {
        images.splice(0, images.length - this.maxCacheSize)
      }
      
      const cacheData = {
        timestamp: Date.now(),
        images
      }
      
      uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData))
      console.log(`保存了 ${images.length} 张图片到本地缓存`)
    } catch (error) {
      console.error('保存图片缓存失败:', error)
    }
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
          
          // 保存到本地缓存
          this.saveCacheToStorage()
          
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

  // 获取产品图片列表（从产品数据中提取）
  getProductImages() {
    try {
      // 动态导入产品数据，避免循环依赖
      const { PRODUCTS } = require('../shared/products.js')
      const productImages = []
      
      Object.values(PRODUCTS).forEach(product => {
        if (product.images && Array.isArray(product.images)) {
          productImages.push(...product.images)
        }
      })
      
      // 去重
      return [...new Set(productImages)].filter(url => url && url.startsWith('http'))
    } catch (error) {
      console.warn('获取产品图片列表失败:', error)
      return []
    }
  }

  // 智能预加载策略 - 优先加载首页和热门产品图片
  getHighPriorityImages() {
    try {
      const { getShowcaseProducts } = require('../shared/products.js')
      const showcaseProducts = getShowcaseProducts()
      const priorityImages = []
      
      // 获取前6个展示产品的图片（首屏显示）
      showcaseProducts.slice(0, 6).forEach(product => {
        if (product.images && product.images.length > 0) {
          priorityImages.push(product.images[0]) // 只预加载第一张图片
        }
      })
      
      return [...new Set(priorityImages)].filter(url => url && url.startsWith('http'))
    } catch (error) {
      console.warn('获取高优先级图片列表失败:', error)
      return []
    }
  }

  // 初始化预加载（在应用启动时调用）
  async init() {
    console.log('开始分阶段预加载图片...')
    
    try {
      // 第一阶段：预加载静态图片（高优先级）
      const staticImages = this.getStaticImages()
      console.log('第一阶段：预加载静态图片...')
      const staticResults = await this.preloadImages(staticImages)
      const staticSuccessCount = staticResults.filter(r => r.status === 'fulfilled').length
      console.log(`静态图片预加载完成: ${staticSuccessCount}/${staticImages.length} 张成功`)
      
      // 第二阶段：预加载首屏产品图片（中优先级）
      const priorityImages = this.getHighPriorityImages()
      if (priorityImages.length > 0) {
        console.log(`第二阶段：预加载首屏产品图片 ${priorityImages.length} 张...`)
        const priorityResults = await this.preloadImages(priorityImages)
        const prioritySuccessCount = priorityResults.filter(r => r.status === 'fulfilled').length
        console.log(`首屏产品图片预加载完成: ${prioritySuccessCount}/${priorityImages.length} 张成功`)
      }
      
      // 第三阶段：延迟预加载其他产品图片（低优先级）
      setTimeout(() => {
        this.preloadRemainingImages()
      }, 2000) // 2秒后开始预加载其他图片
      
      const prioritySuccessCount = priorityImages.length > 0 ? 
        (await this.preloadImages(priorityImages)).filter(r => r.status === 'fulfilled').length : 0
      
      const totalSuccess = staticSuccessCount + prioritySuccessCount
      console.log(`初始预加载完成，成功加载 ${totalSuccess} 张图片`)
      return { staticResults, prioritySuccessCount }
    } catch (error) {
      console.error('预加载过程出错:', error)
      return { staticResults: [], priorityImages: [] }
    }
  }

  // 延迟预加载其他产品图片
  async preloadRemainingImages() {
    console.log('第三阶段：开始延迟预加载其他产品图片...')
    
    try {
      const allProductImages = this.getProductImages()
      const priorityImages = this.getHighPriorityImages()
      
      // 过滤掉已经预加载的图片
      const remainingImages = allProductImages.filter(img => 
        !this.isPreloaded(img) && !priorityImages.includes(img)
      )
      
      if (remainingImages.length > 0) {
        console.log(`开始预加载剩余 ${remainingImages.length} 张产品图片...`)
        
        // 分批预加载，每批 5 张，避免占用过多网络资源
        const batchSize = 5
        for (let i = 0; i < remainingImages.length; i += batchSize) {
          const batch = remainingImages.slice(i, i + batchSize)
          await this.preloadImages(batch)
          
          // 每批之间稍作停顿
          if (i + batchSize < remainingImages.length) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        console.log(`延迟预加载完成，共处理 ${remainingImages.length} 张图片`)
      } else {
        console.log('没有需要延迟预加载的图片')
      }
    } catch (error) {
      console.error('延迟预加载失败:', error)
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
    // 同时清除本地存储
    try {
      uni.removeStorageSync(this.cacheKey)
      console.log('已清除所有图片缓存')
    } catch (error) {
      console.error('清除本地缓存失败:', error)
    }
  }

  // 手动预加载特定产品的图片
  async preloadProductImages(productIds) {
    try {
      const { getProducts } = require('../shared/products.js')
      const products = getProducts(productIds)
      const imagesToLoad = []
      
      products.forEach(product => {
        if (product && product.images) {
          imagesToLoad.push(...product.images)
        }
      })
      
      const uniqueImages = [...new Set(imagesToLoad)].filter(url => 
        url && url.startsWith('http') && !this.isPreloaded(url)
      )
      
      if (uniqueImages.length > 0) {
        console.log(`手动预加载 ${uniqueImages.length} 张产品图片...`)
        const results = await this.preloadImages(uniqueImages)
        const successCount = results.filter(r => r.status === 'fulfilled').length
        console.log(`手动预加载完成: ${successCount}/${uniqueImages.length} 张成功`)
        return results
      }
      
      return []
    } catch (error) {
      console.error('手动预加载产品图片失败:', error)
      return []
    }
  }

  // 获取缓存统计信息
  getCacheStats() {
    const totalCached = this.preloadedImages.size
    const loading = this.loadingPromises.size
    
    return {
      totalCached,
      loading,
      cacheKey: this.cacheKey,
      maxCacheSize: this.maxCacheSize
    }
  }
}

// 创建单例实例
const imagePreloader = new ImagePreloader()

export default imagePreloader
